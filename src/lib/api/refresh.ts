import type { AxiosRequestConfig } from "axios";
import {
  AUTH_REFRESH_PATH,
  getRequestPath,
  isPublicAuthPath,
} from "./routes";

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
  return (
    status === 401 &&
    !config._retry &&
    path !== AUTH_REFRESH_PATH &&
    !isPublicAuthPath(path)
  );
}

export function shouldEndSession(
  config: RetryableRequestConfig,
  status?: number,
): boolean {
  const path = getRequestPath(config.url);

  return (
    (path === AUTH_REFRESH_PATH && (status === 401 || status === 403)) ||
    (status === 401 && !!config._retry && !isPublicAuthPath(path))
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
