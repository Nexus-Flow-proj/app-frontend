import { BASE_URL, CSRF_TOKEN_HEADER } from "@/constants/BackendApisConfig";
import { useAuthStore } from "@/store";
import type { ApiError } from "@/types";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getCsrfToken, SAFE_METHODS } from "./csrf";
import { normalizeApiError } from "./errors";
import {
  isTokenRefreshing,
  processRefreshQueue,
  setTokenRefreshing,
  shouldEndSession,
  shouldAttemptRefresh,
  waitForTokenRefresh,
  type RetryableRequestConfig,
} from "./refresh";
import {
  AUTH_REFRESH_PATH,
  getRequestPath,
  isPublicAuthPath,
  isSessionProbePath,
} from "./routes";
import { queryClient } from "../queryClient";
import { clearSessionCache, isSessionInvalid } from "./session";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const method = config.method?.toLowerCase() ?? "get";
    const path = getRequestPath(config.url);

    if (
      isSessionInvalid() &&
      !isPublicAuthPath(path) &&
      !isSessionProbePath(path)
    ) {
      throw new axios.CanceledError("The session is no longer active.");
    }

    if (!SAFE_METHODS.has(method)) {
      const csrf = getCsrfToken();
      if (csrf) {
        config.headers.set(CSRF_TOKEN_HEADER, csrf);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    if (isSessionInvalid()) {
      return Promise.reject(normalizeApiError(error));
    }

    if (shouldEndSession(originalRequest, error.response?.status)) {
      useAuthStore.getState().logout();
      await clearSessionCache(queryClient);
      return Promise.reject(normalizeApiError(error));
    }

    if (!shouldAttemptRefresh(originalRequest, error.response?.status)) {
      return Promise.reject(normalizeApiError(error));
    }

    if (isTokenRefreshing()) {
      return waitForTokenRefresh()
        .then(() => api(originalRequest))
        .catch((refreshError) => Promise.reject(refreshError));
    }

    originalRequest._retry = true;
    setTokenRefreshing(true);

    try {
      await api.post(AUTH_REFRESH_PATH);
      processRefreshQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      const normalizedRefreshError = axios.isAxiosError(refreshError)
        ? normalizeApiError(refreshError as AxiosError<ApiError>)
        : refreshError;

      processRefreshQueue(normalizedRefreshError);
      useAuthStore.getState().logout();
      await clearSessionCache(queryClient);

      return Promise.reject(normalizedRefreshError);
    } finally {
      setTokenRefreshing(false);
    }
  },
);
