export const SAFE_METHODS = new Set(["get", "head", "options"]);

const CSRF_STORAGE_KEY = "nexus-flow.csrf-token";

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  csrfToken = token ?? null;

  if (typeof window === "undefined") return;

  try {
    if (csrfToken) {
      window.localStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
    } else {
      window.localStorage.removeItem(CSRF_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function clearCsrfToken(): void {
  setCsrfToken(null);
}

export function getCsrfToken(): string | null {
  if (csrfToken) {
    return csrfToken;
  }

  if (typeof document === "undefined") {
    return null;
  }

  try {
    const storedToken = window.localStorage.getItem(CSRF_STORAGE_KEY);
    if (storedToken) {
      csrfToken = storedToken;
      return csrfToken;
    }
  } catch {
    // Fall through to the legacy same-origin cookie lookup.
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
