import { BASE_URL } from "@/constants/BackendApisConfig";
import { useAuthStore } from "@/store";
import type { ApiError } from "@/types";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

const SAFE_METHODS = new Set(["get", "head", "options"]);

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

    if (!SAFE_METHODS.has(method)) {
      const csrf = getCsrfToken();
      if (csrf && config.headers) {
        config.headers["x-csrf-token"] = csrf;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _csrfRetry?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: () => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}

function normalizeApiError(error: AxiosError<ApiError>): ApiError {
  const statusCode = error.response?.status ?? error.response?.data?.statusCode ?? 500;
  const responseMessage = error.response?.data?.message;

  const message =
    responseMessage ??
    (statusCode === 409
      ? "This email is already in use."
      : statusCode === 429
        ? "Too many attempts. Please wait a few minutes before trying again."
        : statusCode === 403
          ? "Your session token expired. Please retry the action."
          : error.message ?? "Something went wrong");

  return {
    message,
    statusCode,
    errors: error.response?.data?.errors,
  };
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    const status = error.response?.status;
    const method = originalRequest.method?.toLowerCase() ?? "get";
    const isMutatingRequest = !SAFE_METHODS.has(method);
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (status === 403 && isMutatingRequest && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      const csrf = getCsrfToken();

      if (csrf) {
        originalRequest.headers = {
          ...originalRequest.headers,
          "x-csrf-token": csrf,
        };
        return api(originalRequest);
      }
    }

    if (status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);
