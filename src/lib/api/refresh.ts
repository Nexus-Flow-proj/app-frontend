import type { AxiosRequestConfig } from "axios";
import { AUTH_REFRESH_PATH, AUTH_ROUTES_WITHOUT_REFRESH, getRequestPath } from "./routes";

export type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: () => void;
  reject: (reason: unknown) => void;
}> = [];

export function shouldAttemptRefresh(
  config: RetryableRequestConfig,
  status?: number,
): boolean {
  const path = getRequestPath(config.url);
  const isPublicAuthRoute = AUTH_ROUTES_WITHOUT_REFRESH.some((route) =>
    path.startsWith(route),
  );

  return (
    status === 401 &&
    !config._retry &&
    path !== AUTH_REFRESH_PATH &&
    !isPublicAuthRoute
  );
}

export function isTokenRefreshing(): boolean {
  return isRefreshing;
}

export function setTokenRefreshing(value: boolean): void {
  isRefreshing = value;
}

export function waitForTokenRefresh(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

export function processRefreshQueue(error: unknown): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}
