export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  PROJECT_INVITATION: (token: string) => `/project/invitation/${token}`,

  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  USER_PROFILE: (userId: string) => `/users/${userId}`,

  PROJECT_NEW: "/drafts/new",
  DRAFT_NEW: "/drafts/new",
  DRAFT_DETAIL: (id: string) => `/drafts/${id}`,
  DRAFT_WORKSHOP: (id: string) => `/drafts/${id}/workshop`,

  PROJECT_OVERVIEW: (id: string) => `/projects/${id}`,
  PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings`,
  PROJECT_INVITES: (id: string) => `/projects/${id}/settings/invites`,
  PROJECT_MEMBERS: (id: string) => `/projects/${id}/members`,
  PROJECT_ROLES: (id: string) => `/projects/${id}/roles`,
  WORKSHOP: (id: string) => `/projects/${id}/workshop`,
  BOARDS: (id: string) => `/projects/${id}/boards`,
  CALENDAR: (id: string) => `/projects/${id}/calendar`,
  MY_WORKSPACE: (id: string) => `/projects/${id}/my-workshop`,
} as const;
