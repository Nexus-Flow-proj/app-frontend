import { BASE_URL } from "@/constants/BackendApisConfig";

export const AUTH_REFRESH_PATH = "/auth/refresh";

export const AUTH_ROUTES_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/signup",
  "/auth/forget-password",
  "/auth/reset-password",
  "/auth/logout",
];

export function getRequestPath(url?: string): string {
  if (!url) {
    return "";
  }

  try {
    const { pathname } = new URL(url, BASE_URL);
    return pathname.replace(/^\/api(?=\/)/, "");
  } catch {
    return url.split("?")[0] ?? "";
  }
}
