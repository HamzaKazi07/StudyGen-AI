const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const developmentHost =
  typeof window === "undefined" ? "localhost" : window.location.hostname;
const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl = import.meta.env.DEV
  ? `http://${developmentHost}:8000`
  : window.location.origin;

let resolvedApiUrl = configuredApiUrl || defaultApiUrl;
if (import.meta.env.DEV && configuredApiUrl && typeof window !== "undefined") {
  const parsedApiUrl = new URL(configuredApiUrl);
  if (
    LOCAL_HOSTS.has(developmentHost) &&
    LOCAL_HOSTS.has(parsedApiUrl.hostname) &&
    parsedApiUrl.protocol === "http:"
  ) {
    parsedApiUrl.hostname = developmentHost;
    resolvedApiUrl = parsedApiUrl.toString();
  }
}

const API_URL = resolvedApiUrl.replace(/\/+$/, "");

let csrfToken = null;

export function setCsrfToken(value) {
  csrfToken = value;
}

export async function apiFetch(path, options = {}) {
  const {
    notifyOnUnauthorized = true,
    headers: suppliedHeaders,
    ...fetchOptions
  } = options;
  const headers = new Headers(suppliedHeaders || {});
  const method = (fetchOptions.method || "GET").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && notifyOnUnauthorized) {
    window.dispatchEvent(new Event("studygen:unauthorized"));
  }

  return response;
}
