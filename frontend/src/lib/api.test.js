import { afterEach, describe, expect, it, vi } from "vitest";

describe("apiFetch development API URL", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("aligns an explicit loopback API host with the frontend hostname", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:8000");
    vi.stubGlobal("window", {
      location: { hostname: "127.0.0.1" },
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));

    const { apiFetch } = await import("./api");
    await apiFetch("/api/auth/me");

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
