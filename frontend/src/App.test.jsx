import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const { apiFetch, setCsrfToken } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  setCsrfToken: vi.fn(),
}));

vi.mock("./lib/api", () => ({ apiFetch, setCsrfToken }));

import App from "./App";

const testUser = { id: "user-1", email: "student@example.com" };
const testCsrf = "test-csrf-token";

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function respondUnauthorized(options) {
  if (options?.notifyOnUnauthorized !== false) {
    window.dispatchEvent(new Event("studygen:unauthorized"));
  }
  return jsonResponse({ detail: "Authentication required." }, 401);
}

describe("authentication navigation", () => {
  let sessionValid;

  beforeEach(() => {
    sessionValid = false;
    window.history.replaceState({}, "", "/");
    setCsrfToken.mockClear();
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path, options = {}) => {
      if (path === "/api/auth/me") {
        return sessionValid
          ? jsonResponse({ user: testUser, csrf_token: testCsrf })
          : jsonResponse({ detail: "Authentication required." }, 401);
      }
      if (path === "/api/auth/login") {
        sessionValid = true;
        return jsonResponse({ user: testUser, csrf_token: testCsrf });
      }
      if (path === "/api/documents") {
        return sessionValid
          ? jsonResponse({ documents: [] })
          : respondUnauthorized(options);
      }
      if (path === "/api/tutor/ask") {
        const events = [
          'event: start\ndata: {"success":true}\n\n',
          'event: chunk\ndata: {"text":"Public tutor answer"}\n\n',
          'event: done\ndata: {"success":true}\n\n',
        ];
        let delivered = false;
        return {
          ok: true,
          status: 200,
          body: {
            getReader: () => ({
              read: async () => {
                if (delivered) {
                  return { done: true };
                }
                delivered = true;
                return {
                  done: false,
                  value: new TextEncoder().encode(events.join("")),
                };
              },
            }),
          },
        };
      }
      return jsonResponse({ detail: "Unexpected test request." }, 500);
    });
  });

  afterEach(() => {
    cleanup();
  });

  async function signIn() {
    const submitButton = screen.getByRole("button", { name: "Sign in" });
    await waitFor(() => expect(submitButton.disabled).toBe(false));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: testUser.email },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "a-secure-test-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  }

  it("returns to Documents after login when that was the requested page", async () => {
    window.history.replaceState({}, "", "/documents");
    render(<App />);

    await screen.findByRole("button", { name: "Sign in" });
    await signIn();

    expect(await screen.findByRole("heading", { name: "Documents" })).toBeTruthy();
    expect(window.location.pathname).toBe("/documents");
  });

  it("keeps auth state while navigating from Dashboard to Documents", async () => {
    sessionValid = true;
    render(<App />);

    const documentsLink = await screen.findByRole("link", { name: "Documents" });
    fireEvent.click(documentsLink);

    expect(await screen.findByRole("heading", { name: "Documents" })).toBeTruthy();
    expect(window.location.pathname).toBe("/documents");
    expect(apiFetch).toHaveBeenCalledWith("/api/documents");
  });

  it("restores a valid session after an app remount", async () => {
    sessionValid = true;
    const firstRender = render(<App />);
    await screen.findByRole("link", { name: "Documents" });
    firstRender.unmount();

    render(<App />);

    expect(await screen.findByRole("link", { name: "Documents" })).toBeTruthy();
    expect(apiFetch.mock.calls.filter(([path]) => path === "/api/auth/me")).toHaveLength(2);
  });

  it("sends unauthenticated users to login and returns after successful login", async () => {
    window.history.replaceState({}, "", "/documents");
    render(<App />);

    await screen.findByRole("button", { name: "Sign in" });
    expect(window.location.pathname).toBe("/login");
    await signIn();

    await screen.findByRole("heading", { name: "Documents" });
    expect(window.location.pathname).toBe("/documents");
  });

  it("allows an unauthenticated visitor to open the Dashboard", async () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(await screen.findByRole("heading", { name: /Welcome back, Student/ })).toBeTruthy();
    expect(window.location.pathname).toBe("/");
    expect(screen.getByText("Browsing as a guest")).toBeTruthy();
  });

  it("allows visitors to open public Quizzes and Flashcards", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: /Welcome back, Student/ });

    fireEvent.click(screen.getByRole("link", { name: "Quizzes" }));
    expect(await screen.findByRole("heading", { name: "Quizzes" })).toBeTruthy();
    expect(window.location.pathname).toBe("/quizzes");

    fireEvent.click(screen.getByRole("link", { name: "Flashcards" }));
    expect(await screen.findByRole("heading", { name: "Flashcards" })).toBeTruthy();
    expect(window.location.pathname).toBe("/flashcards");
  });

  it("allows an unauthenticated visitor to ask a general tutor question", async () => {
    window.history.replaceState({}, "", "/ai-tutor");
    render(<App />);

    const input = await screen.findByPlaceholderText("Ask your AI tutor anything...");
    fireEvent.change(input, { target: { value: "What is a tree?" } });
    fireEvent.click(screen.getByRole("button", { name: /Ask AI/ }));

    expect(await screen.findByText("Public tutor answer")).toBeTruthy();
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/tutor/ask",
      expect.objectContaining({ method: "POST" }),
    );
    const tutorRequest = apiFetch.mock.calls.find(
      ([path]) => path === "/api/tutor/ask",
    )[1];
    expect(JSON.parse(tutorRequest.body)).toMatchObject({
      question: "What is a tree?",
    });
    expect(window.location.pathname).toBe("/ai-tutor");
  });

  it("shows a notice when a document tutor request uses a partial excerpt", async () => {
    sessionValid = true;
    window.history.replaceState({}, "", "/ai-tutor?document_id=private-doc");
    apiFetch.mockImplementation(async (path) => {
      if (path === "/api/auth/me") {
        return jsonResponse({ user: testUser, csrf_token: testCsrf });
      }
      if (path === "/api/documents") {
        return jsonResponse({
          documents: [{
            id: "private-doc",
            name: "Long notes.txt",
            status: "Processed",
            processed: true,
          }],
        });
      }
      if (path === "/api/tutor/ask") {
        const events = [
          'event: start\ndata: {"success":true,"document_id":"private-doc","document_name":"Long notes.txt","document_context_truncated":true,"document_context_chars":12000,"document_extracted_chars":14000}\n\n',
          'event: chunk\ndata: {"text":"The excerpt says..."}\n\n',
          'event: done\ndata: {"success":true}\n\n',
        ];
        return {
          ok: true,
          status: 200,
          body: {
            getReader: () => {
              let delivered = false;
              return {
                read: async () => {
                  if (delivered) return { done: true };
                  delivered = true;
                  return { done: false, value: new TextEncoder().encode(events.join("")) };
                },
              };
            },
          },
        };
      }
      return jsonResponse({ detail: "Unexpected test request." }, 500);
    });

    render(<App />);
    await screen.findByText("Using document: Long notes.txt");
    fireEvent.change(
      await screen.findByPlaceholderText("Ask your AI tutor anything..."),
      { target: { value: "What does the final section say?" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /Ask AI/ }));

    expect(
      await screen.findByText(/Answers use an excerpt of the extracted text/),
    ).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("12,000 of 14,000");
  });

  it("aborts the tutor request when navigating away", async () => {
    let tutorRequest;
    apiFetch.mockImplementation((path, options = {}) => {
      if (path === "/api/auth/me") {
        return Promise.resolve(jsonResponse({ detail: "Authentication required." }, 401));
      }
      if (path === "/api/tutor/ask") {
        tutorRequest = options;
        return new Promise((resolve, reject) => {
          options.signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
      }
      return Promise.resolve(jsonResponse({ detail: "Unexpected test request." }, 500));
    });

    render(<App />);
    await screen.findByRole("heading", { name: /Welcome back, Student/ });
    fireEvent.click(screen.getByRole("link", { name: "AI Tutor" }));
    fireEvent.change(
      await screen.findByPlaceholderText("Ask your AI tutor anything..."),
      { target: { value: "Explain photosynthesis." } },
    );
    fireEvent.click(screen.getByRole("button", { name: /Ask AI/ }));
    await waitFor(() => expect(tutorRequest).toBeTruthy());

    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    await screen.findByRole("heading", { name: /Welcome back, Student/ });
    expect(tutorRequest.signal.aborted).toBe(true);
  });

  it("requires login before opening document-aware tutoring", async () => {
    window.history.replaceState({}, "", "/ai-tutor?document_id=private-doc");
    render(<App />);

    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(window.location.pathname).toBe("/login");
    expect(apiFetch).not.toHaveBeenCalledWith("/api/documents");
  });

  it("treats an expired session as unauthenticated", async () => {
    sessionValid = true;
    apiFetch.mockImplementation(async (path, options = {}) => {
      if (path === "/api/auth/me") {
        return jsonResponse({ user: testUser, csrf_token: testCsrf });
      }
      if (path === "/api/documents") {
        sessionValid = false;
        return respondUnauthorized(options);
      }
      return jsonResponse({}, 500);
    });
    render(<App />);

    fireEvent.click(await screen.findByRole("link", { name: "Documents" }));

    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(window.location.pathname).toBe("/login");
  });

  it("shows restoration failures separately from unauthenticated state", async () => {
    window.history.replaceState({}, "", "/documents");
    apiFetch.mockRejectedValue(new Error("API unavailable"));
    render(<App />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Unable to verify your session.",
    );
    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
