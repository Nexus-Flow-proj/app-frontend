export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const PROXY_TARGET =
  import.meta.env.VITE_API_PROXY_TARGET ??
  "https://nexus-flow-backend.up.railway.app//";

export const CSRF_TOKEN_HEADER = "x-csrf-token";
