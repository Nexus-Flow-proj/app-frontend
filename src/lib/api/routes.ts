import { BASE_URL } from "@/constants/BackendApisConfig";

export const AUTH_REFRESH_PATH = "/auth/refresh";
export const AUTH_ME_PATH = "/auth/me";

export const AUTH_ROUTES_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/signup",
  "/auth/forget-password",
  "/auth/reset-password",
  "/auth/logout",
];

export function isPublicAuthPath(path: string): boolean {
  return AUTH_ROUTES_WITHOUT_REFRESH.some((route) => path.startsWith(route));
}

export function isSessionProbePath(path: string): boolean {
  return path === AUTH_ME_PATH;
}

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
