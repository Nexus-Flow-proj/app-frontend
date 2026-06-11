import { BASE_URL } from "@/constants/BackendApisConfig";
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// ─── CSRF Token Reader ────────────────────────────────────────────────────────
// The backend sets a JS-readable cookie named "csrf-token" (not HTTP-only).
// We read it and send it as a header so the server can verify the request
// originated from our app, not a cross-site form or link.
function getCsrfToken(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

const SAFE_METHODS = new Set(["get", "head", "options"]);

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HTTP-only JWT cookie automatically
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor — attach CSRF token on mutating requests ─────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const method = config.method?.toLowerCase() ?? "get";
    if (!SAFE_METHODS.has(method)) {
      const csrf = getCsrfToken();
      if (csrf && config.headers) {
        config.headers["X-CSRF-Token"] = csrf;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — handle 401 globally ───────────────────────────────
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

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (is401 && !originalRequest._retry && !isRefreshEndpoint) {
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
        // The server rotates both the access + refresh HTTP-only cookies
        // and issues a fresh CSRF token cookie in this response.
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
