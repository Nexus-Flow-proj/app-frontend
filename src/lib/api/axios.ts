import { BASE_URL, CSRF_TOKEN_HEADER } from "@/constants/BackendApisConfig";
import { useAuthStore, useUpgradeModalStore } from "@/store";
import type { ApiError, ApiResponse } from "@/types";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getCsrfToken, SAFE_METHODS, setCsrfToken } from "./csrf";
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

type RefreshResponseData = {
  csrfToken?: string;
} | null;

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
    const status = error.response?.status;
    const errorData = error.response?.data as any;

    const isLimitOrPaymentError =
      status === 402 ||
      errorData?.statusCode === 402 ||
      errorData?.error === "Payment Required" ||
      errorData?.code === "PAYMENT_REQUIRED" ||
      errorData?.code === "AI_FREE_QUOTA_EXCEEDED" ||
      errorData?.code === "AI_ONBOARDING_QUOTA_EXCEEDED" ||
      errorData?.code === "AI_CHAT_QUOTA_EXCEEDED" ||
      errorData?.code === "AI_TASK_QUOTA_EXCEEDED" ||
      errorData?.code === "PROJECT_LIMIT_REACHED" ||
      errorData?.code === "MEMBER_LIMIT_REACHED" ||
      errorData?.code === "TASK_LIMIT_REACHED" ||
      errorData?.code === "COLUMN_LIMIT_REACHED" ||
      errorData?.code === "CUSTOM_ROLES_NOT_ALLOWED" ||
      errorData?.code === "KNOWLEDGE_BASE_NOT_ALLOWED" ||
      errorData?.code === "KNOWLEDGE_CHUNK_LIMIT_REACHED" ||
      errorData?.code === "PLAN_UPGRADE_REQUIRED" ||
      (typeof errorData?.code === "string" &&
        (errorData.code.startsWith("AI_") ||
          errorData.code.includes("QUOTA") ||
          errorData.code.includes("LIMIT"))) ||
      (typeof errorData?.message === "string" &&
        (errorData.message.toLowerCase().includes("quota") ||
          errorData.message.toLowerCase().includes("3 free") ||
          errorData.message.toLowerCase().includes("upgrade to pro") ||
          errorData.message.toLowerCase().includes("payment required")));

    if (isLimitOrPaymentError) {
      useUpgradeModalStore.getState().openUpgradePrompt({
        statusCode: 402,
        error: errorData?.error ?? "Payment Required",
        code: errorData?.code ?? "AI_FREE_QUOTA_EXCEEDED",
        message:
          typeof errorData?.message === "string"
            ? errorData.message
            : Array.isArray(errorData?.message)
              ? errorData.message.join(". ")
              : "You have reached a plan limit. Upgrade your plan to continue.",
        limitType: errorData?.limitType ?? "AI Requests",
        limit: errorData?.limit ?? (errorData?.code?.includes("AI") ? 3 : undefined),
        current: errorData?.current ?? (errorData?.code?.includes("AI") ? 3 : undefined),
        requiredPlan: errorData?.requiredPlan ?? "PRO",
        upgradeUrl: errorData?.upgradeUrl ?? "/pricing",
      });
      return Promise.reject(normalizeApiError(error));
    }

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
      const refreshResponse =
        await api.post<ApiResponse<RefreshResponseData>>(AUTH_REFRESH_PATH);

      setCsrfToken(refreshResponse.data.data?.csrfToken);
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
