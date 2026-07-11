export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: () => [...QUERY_KEYS.projects.all, "list"] as const,
    detail: (id: string) => [...QUERY_KEYS.projects.all, "detail", id] as const,
    members: (id: string) =>
      [...QUERY_KEYS.projects.all, "members", id] as const,
    roles: (id: string) => [...QUERY_KEYS.projects.all, "roles", id] as const,
    invites: (id: string) =>
      [...QUERY_KEYS.projects.all, "invites", id] as const,
    invitation: (token: string) =>
      [...QUERY_KEYS.projects.all, "invitation", token] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (projectId: string) =>
      [...QUERY_KEYS.tasks.all, "list", projectId] as const,
    detail: (id: string) => [...QUERY_KEYS.tasks.all, "detail", id] as const,
    byColumn: (projectId: string, columnId: string) =>
      [...QUERY_KEYS.tasks.all, "byColumn", projectId, columnId] as const,
    subtasks: (taskId: string) =>
      [...QUERY_KEYS.tasks.all, "subtasks", taskId] as const,
    comments: (taskId: string) =>
      [...QUERY_KEYS.tasks.all, "comments", taskId] as const,
    attachments: (taskId: string) =>
      [...QUERY_KEYS.tasks.all, "attachments", taskId] as const,
    activity: (taskId: string) =>
      [...QUERY_KEYS.tasks.all, "activity", taskId] as const,
  },
  boards: {
    all: ["boards"] as const,
    columns: (projectId: string) =>
      [...QUERY_KEYS.boards.all, "columns", projectId] as const,
    tasks: (projectId: string) =>
      [...QUERY_KEYS.boards.all, "tasks", projectId] as const,
  },
  canvas: {
    all: ["canvas"] as const,
    main: (projectId: string) =>
      [...QUERY_KEYS.canvas.all, "main", projectId] as const,
    mini: (projectId: string) =>
      [...QUERY_KEYS.canvas.all, "mini", projectId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...QUERY_KEYS.notifications.all, "list"] as const,
    unreadCount: () =>
      [...QUERY_KEYS.notifications.all, "unreadCount"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    analytics: () => [...QUERY_KEYS.dashboard.all, "analytics"] as const,
    activity: () => [...QUERY_KEYS.dashboard.all, "activity"] as const,
    deadlines: () => [...QUERY_KEYS.dashboard.all, "deadlines"] as const,
  },
} as const;
