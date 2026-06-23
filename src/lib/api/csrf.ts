export const SAFE_METHODS = new Set(["get", "head", "options"]);

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
