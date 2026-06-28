export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  PROJECT_INVITATION: (token: string) => `/project/invitation/${token}`,

  DASHBOARD: "/dashboard",

  PROJECT_NEW: "/projects/new",

  PROJECT_OVERVIEW: (id: string) => `/projects/${id}`,
  PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings`,
  WORKSHOP: (id: string) => `/projects/${id}/workshop`,
  BOARDS: (id: string) => `/projects/${id}/boards`,
  MY_WORKSPACE: (id: string) => `/projects/${id}/my-workspace`,
} as const;
