export const SAFE_METHODS = new Set(["get", "head", "options"]);

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  csrfToken = token ?? null;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

export function getCsrfToken(): string | null {
  if (csrfToken) {
    return csrfToken;
  }

  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
