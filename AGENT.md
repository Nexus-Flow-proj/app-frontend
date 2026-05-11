# AGENT.md — Nexus-Flow

> This file is the authoritative reference for any AI agent (Claude, Copilot, Cursor, etc.) contributing to the Nexus-Flow frontend codebase. Read this entire file before generating any code, file, or folder.

---

## Project Identity

**Nexus-Flow** is a collaborative project management web application built for small teams (up to ~10 members). It combines a visual infinite-canvas Workshop, AI-assisted project planning, and a Kanban-style Team Board into one unified platform. The product is inspired by Trello but extends the experience significantly with a freeform mind-mapping workspace and an AI planning panel.

---

## Project Goals

1. Enable team admins to plan projects visually through an infinite canvas — this feature is named the **Main Workshop**.
2. Allow AI-assisted generation of a full project mindmap from a natural-language brief, producing agile-ready tasks that can be directly assigned to team members.
3. Convert the AI-generated mindmap into real-time task management through a Kanban Board interface built for agile teams — this feature is named the **Team Board**.
4. Provide each member with a focused personal Workshop (also an infinite canvas, named the **Mini Workshop**) scoped to their assigned tasks — used exclusively for mind mapping and note-taking via sticky notes, not for task creation or management.
5. Aggregate analytics across all user projects on a personal **Dashboard**.

---

## Tech Stack (locked — do not deviate)

| Concern              | Library                             |
| -------------------- | ----------------------------------- |
| Framework            | React 18 + TypeScript               |
| Build                | Vite                                |
| Routing              | React Router v6                     |
| Global / UI state    | Zustand                             |
| Server state / cache | TanStack React Query v5             |
| Canvas               | Konva.js + react-konva              |
| Styling              | Tailwind CSS + shadcn/ui (Radix UI) |
| Forms                | react-hook-form + zod               |
| Real-time            | Socket.IO client                    |
| Charts               | Recharts                            |
| Drag & drop          | @dnd-kit/core + @dnd-kit/sortable   |
| Dates                | date-fns                            |
| HTTP                 | axios                               |
| Notifications (UI)   | sonner                              |

**Never use:** Redux, MobX, styled-components, Emotion, CSS modules, class components, Next.js, or any SSR framework.

---

## Folder Structure

This is the exact `src/` layout. Match it precisely — do not invent new top-level folders.

```
src/
├── @types/
├── components/
│   ├── hoc/                        # Higher-order components
│   ├── layout/
│   │   ├── footer/
│   │   ├── header/
│   │   └── Main.tsx                # Root layout wrapper
│   ├── shared/
│   │   ├── Feedback/               # Error boundaries, empty states, skeletons
│   │   └── Spinner.tsx
│   └── ui/                         # shadcn/ui generated components (do not hand-edit)
│
├── constants/                      # QUERY_KEYS, API_BASE_URL, COOKIE_KEYS, etc.
│
├── features/                       # Feature-first modules (see below)
│   ├── auth/
│   ├── dashboard/
│   ├── project/
│   ├── workshop/
│   ├── boards/
│   └── mini-workshop/
│
├── hooks/                          # Shared React Query base wrappers only
│   ├── useApiQuery.ts
│   ├── useApiMutation.ts
│   └── useApiInfiniteQuery.ts
│
├── lib/
│
├── providers/                      # App-level providers (QueryClient, Toaster, etc.)
│
└── services/                       # Shared/cross-feature services (e.g. socket service)
```

---

## Feature Module Structure

Every feature folder follows this layout **exactly**. All subfolders are present even if initially empty.

```
features/
└── feature-name/
    ├── components/      # Feature-specific React components
    ├── layout/          # Feature-level layout wrappers (if needed)
    ├── pages/           # Route-level page components (one file = one route)
    ├── services/        # API client calls — only place HTTP calls are made
    ├── hooks/           # Custom React Query hooks (queries + mutations)
    ├── types/           # TypeScript interfaces, enums, and domain types
    ├── constants/       # Feature-scoped constants
    ├── validation/      # Zod schemas and related validation logic
    └── utils/           # Feature-scoped utility/helper functions
```

### The Six Main Features — Full Page & Component Inventory (can modify it in the future)

#### `auth/`

Login, registration, invite accept, forgot password, reset password.

```
auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   └── InvitePreviewCard.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx        # /reset-password?token=...
│   └── InviteAcceptPage.tsx         # /invite/:token
├── hooks/
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useForgotPassword.ts
│   ├── useResetPassword.ts
│   └── useInviteAccept.ts
├── services/
│   └── index.ts
├── validation/
│   ├── login.schema.ts
│   ├── register.schema.ts
│   ├── forgot-password.schema.ts
│   └── reset-password.schema.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts
```

#### `dashboard/`

Personal dashboard with analytics, project list sidebar, upcoming deadlines, activity feed.

```
dashboard/
├── components/
│   ├── SummaryCards.tsx             # Total tasks, completed, in-progress, hours
│   ├── TasksBarChart.tsx            # Tasks completed per project (last 30 days)
│   ├── UpcomingDeadlinesList.tsx
│   ├── ActivityFeed.tsx
│   ├── ProjectSidebarItem.tsx
│   └── OnboardingCard.tsx           # Empty state for new users
├── pages/
│   └── DashboardPage.tsx
├── hooks/
│   ├── useDashboardAnalytics.ts
│   ├── useActivityFeed.ts
│   └── useUpcomingDeadlines.ts
├── services/
│   └── index.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts
```

#### `project/`

Create project, manage project settings, invite team members, manage pending invites.

```
project/
├── components/
│   ├── CreateProjectForm.tsx
│   ├── InviteMembersForm.tsx
│   ├── PendingInvitesList.tsx
│   ├── PendingInviteRow.tsx
│   └── ProjectSettingsPanel.tsx
├── pages/
│   ├── CreateProjectPage.tsx        # /projects/new
│   └── ProjectSettingsPage.tsx      # /projects/:id/settings
├── hooks/
│   ├── useCreateProject.ts
│   ├── useProjectMembers.ts
│   ├── useInviteMembers.ts
│   ├── useResendInvite.ts
│   └── useProjectSettings.ts
├── services/
│   └── index.ts
├── validation/
│   ├── create-project.schema.ts
│   └── invite.schema.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts
```

#### `workshop/`

Infinite canvas (Main Workshop), toolbar, AI Panel drawer, task card detail drawer, real-time collaboration.

```
workshop/
├── components/
│   ├── canvas/
│   │   ├── WorkshopStage.tsx        # Konva Stage + Layer root
│   │   ├── StickyNote.tsx
│   │   ├── TaskCardNode.tsx
│   │   ├── ImageBlock.tsx
│   │   ├── ConnectorLine.tsx
│   │   ├── SectionFrame.tsx
│   │   └── MiniMap.tsx
│   ├── toolbar/
│   │   ├── WorkshopToolbar.tsx
│   │   └── ToolbarButton.tsx
│   ├── ai-panel/
│   │   ├── AIPanelDrawer.tsx
│   │   ├── AIBriefForm.tsx
│   │   ├── AITaskPreviewList.tsx
│   │   └── AITaskPreviewCard.tsx
│   └── task-drawer/
│       ├── TaskDetailDrawer.tsx
│       ├── SubtaskChecklist.tsx
│       ├── CommentThread.tsx
│       └── ActivityLog.tsx
├── pages/
│   └── WorkshopPage.tsx             # /projects/:id/workshop
├── hooks/
│   ├── useCanvasState.ts
│   ├── useCanvasSync.ts             # debounced PATCH + auto-save
│   ├── useUndoRedo.ts
│   ├── useWorkshopSocket.ts
│   ├── useGenerateMindmap.ts        # AI Panel mutation
│   ├── useTaskDetail.ts
│   └── useCreateTask.ts
├── services/
│   └── index.ts
├── validation/
│   └── task.schema.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts                     # CANVAS_GRID_SIZE, AUTOSAVE_INTERVAL, etc.
```

#### `boards/`

Team Board — Kanban columns, task cards, drag-and-drop, filtering, sorting.

```
boards/
├── components/
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── TaskCard.tsx
│   ├── BoardFilters.tsx
│   ├── BoardSearchBar.tsx
│   └── AddColumnButton.tsx
├── pages/
│   └── BoardsPage.tsx               # /projects/:id/boards
├── hooks/
│   ├── useBoardColumns.ts
│   ├── useTasksByColumn.ts
│   ├── useMoveTask.ts               # optimistic drag-and-drop mutation
│   └── useBoardFilters.ts
├── services/
│   └── index.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts                     # DEFAULT_COLUMNS, PROTECTED_COLUMNS, etc.
```

#### `mini-workshop/`

Member's private canvas — sticky notes, subtask cards, personal connectors only.

```
mini-workshop/
├── components/
│   ├── canvas/
│   │   ├── MiniWorkshopStage.tsx
│   │   ├── PersonalStickyNote.tsx
│   │   └── SubtaskCardNode.tsx
│   └── toolbar/
│       └── MiniWorkshopToolbar.tsx
├── pages/
│   └── MiniWorkshopPage.tsx         # /projects/:id/my-workspace
├── hooks/
│   ├── useMiniCanvasState.ts
│   ├── useAssignedTasks.ts
│   └── useCreateSubtask.ts
├── services/
│   └── index.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts
```

---

## Data Layer Rules

### React Query — server state

- All data that comes from the API lives **exclusively** in React Query cache.
- Never duplicate API data in Zustand.
- Use `QUERY_KEYS` (from `src/constants/Querykeys.ts`) as the single source of truth for cache keys.
- Prefer `QUERY_KEYS.<feature>.all` for list invalidation.
- Use dynamic keys for details: `QUERY_KEYS.tasks.detail(id)`.

### Zustand — UI / local state only

| Slice           | Responsibility                                   |
| --------------- | ------------------------------------------------ |
| `authStore`     | Current user, JWT token, logout                  |
| `projectStore`  | Active project, member list, roles               |
| `workshopStore` | Canvas objects, selection state, undo/redo stack |
| `boardStore`    | Columns, task cards, drag state                  |
| `uiStore`       | Sidebar open, modal stack, toast queue           |

---

## API Response Shape

All backend responses follow this exact contract. The axios client in `src/lib/api/` unwraps the response before returning to hooks:

```ts
// src/lib/api/types.ts

interface Meta {
  total: number;
  pages: number;
  currentPage: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: Meta;
  data: T;
}
```

Usage patterns in hooks:

- `response.data` → the typed payload
- `response.message` → surface in sonner toast on success/error
- `response.success` → boolean guard before processing
- `response.meta` → use for paginated queries (`useApiInfiniteQuery`)

---

## Custom Hook Pattern

All data-fetching hooks live inside `features/<name>/hooks/` and follow this pattern:

**Query hook:**

```ts
// features/boards/hooks/useTasksByColumn.ts

import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants/Querykeys";
import { boardService } from "../services";

export function useTasksByColumn(projectId: string) {
  return useApiQuery(
    QUERY_KEYS.boards.tasks(projectId),
    () => boardService.getTasksByColumn(projectId),
    { enabled: !!projectId, staleTime: 1000 * 60 * 2 },
  );
}
```

**Mutation hook:**

```ts
// features/boards/hooks/useMoveTask.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/Querykeys";
import { boardService } from "../services";
import type { MoveTaskDto } from "../types";

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: MoveTaskDto) => boardService.moveTask(dto),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boards.tasks(projectId),
      });
      toast.success(res.message);
    },
    onError: (err: ApiResponse<null>) => {
      toast.error(err.message ?? "Something went wrong");
    },
  });
}
```

**Rules for hooks:**

1. Hooks call the **feature service**, not the axios client directly.
2. Always pass `enabled` when the query depends on a param that may be undefined.
3. Use `useQueryClient()` + `invalidateQueries` or `setQueryData` for cache updates after mutations.
4. Surface `response.message` via `sonner` toast in `onSuccess` / `onError`.
5. Mutation hooks live alongside query hooks in the same `hooks/` folder.

---

## Service Pattern

Feature services are the **only** place HTTP calls are made. They call the axios instance from `src/lib/api/`:

```ts
// features/auth/services/index.ts

import { api } from "@/lib/api";
import type {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthUser,
  InvitePreview,
} from "../types";
import type { ApiResponse } from "@/lib/api/types";

export const authService = {
  login: (dto: LoginDto) => api.post<ApiResponse<AuthUser>>("/auth/login", dto),

  register: (dto: RegisterDto) =>
    api.post<ApiResponse<AuthUser>>("/auth/register", dto),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  forgotPassword: (dto: ForgotPasswordDto) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", dto),

  resetPassword: (dto: ResetPasswordDto) =>
    api.post<ApiResponse<null>>("/auth/reset-password", dto),

  getInvite: (token: string) =>
    api.get<ApiResponse<InvitePreview>>(`/auth/invite/${token}`),

  acceptInvite: (token: string) =>
    api.post<ApiResponse<AuthUser>>(`/auth/invite/${token}/accept`),
};
```

---

## Component Rules

- All components are **functional** with typed props via a TypeScript `interface`.
- Use Tailwind CSS utility classes for styling — never inline styles or CSS-in-JS.
- Use shadcn/ui primitives (Radix-based) for all interactive UI (modals, drawers, selects, tooltips, etc.).
- When generating a component, produce a **complete, self-contained `.tsx` file**.
- Components inside `src/components/ui/` are generated by the shadcn CLI — **do not hand-edit them**.

---

## Validation Pattern

Zod schemas live in `features/<name>/validation/` — one file per form/action:

```ts
// features/auth/validation/forgot-password.schema.ts
import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
```

```ts
// features/auth/validation/reset-password.schema.ts
import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
```

Wire into forms via `react-hook-form`:

```ts
const form = useForm<ForgotPasswordDto>({
  resolver: zodResolver(forgotPasswordSchema),
});
```

---

## Routing & Guards

Routes are defined in `src/router/`. Guards read `authStore` and RBAC helpers from `src/lib/rbac/`:

| Route                        | Access                  | Page component        |
| ---------------------------- | ----------------------- | --------------------- |
| `/login`                     | Public                  | `LoginPage`           |
| `/register`                  | Public                  | `RegisterPage`        |
| `/forgot-password`           | Public                  | `ForgotPasswordPage`  |
| `/reset-password`            | Public (token required) | `ResetPasswordPage`   |
| `/invite/:token`             | Public                  | `InviteAcceptPage`    |
| `/dashboard`                 | Auth required           | `DashboardPage`       |
| `/projects/new`              | Auth required           | `CreateProjectPage`   |
| `/projects/:id/settings`     | Admin only              | `ProjectSettingsPage` |
| `/projects/:id/workshop`     | Admin only              | `WorkshopPage`        |
| `/projects/:id/boards`       | Auth + member           | `BoardsPage`          |
| `/projects/:id/my-workspace` | Member only             | `MiniWorkshopPage`    |

---

## Real-time (Socket.IO)

- Socket connection is managed in a shared service at `src/services/socket.ts`.
- Feature-level hooks (e.g. `useWorkshopSocket`) subscribe and clean up on unmount.
- Canvas events broadcast on `/ws/projects/:id/canvas`.
- Optimistic updates are applied immediately; WebSocket confirmation reconciles state.
- Conflict resolution: last-write-wins per field.

---

## Canvas (Konva.js) Notes

- Use `react-konva` components (`Stage`, `Layer`, `Rect`, `Text`, `Line`, etc.).
- Canvas state (objects, connections) is stored in `workshopStore` (Zustand) and persisted via `PATCH /projects/:id/canvas` with a **1.5s debounce**.
- Auto-save fires every **30 seconds** as a fallback.
- Undo/redo stack: up to **50 steps**, managed in `workshopStore`.
- Mini-map renders in the bottom-right corner as a scaled-down overview using a secondary Konva Stage.
- Mini Workshop uses the same pan/zoom mechanics but restricts object types to sticky notes, subtask cards, and connectors only.

---

## Key Domain Terminology

| Term              | Definition                                                                           |
| ----------------- | ------------------------------------------------------------------------------------ |
| **Main Workshop** | Admin's infinite canvas — mindmapping + task creation                                |
| **Mini Workshop** | Member's private canvas — notes and mindmapping only, no task creation               |
| **Team Board**    | Kanban board (Backlog → In Progress → In Review → Done)                              |
| **AI Panel**      | Slide-out drawer inside the Main Workshop for AI mindmap generation                  |
| **Task card**     | Atomic unit of work; exists on the canvas AND on the Team Board (bidirectional sync) |

---

## What NOT to Generate

- ❌ Next.js files: `app/`, `pages/`, `layout.tsx`, `use client`, `use server`, `getServerSideProps`
- ❌ Redux store, actions, reducers, or `createSlice`
- ❌ styled-components, Emotion, or any CSS-in-JS
- ❌ Class-based React components
- ❌ Direct `fetch()` calls inside components — always use the service → hook pattern
- ❌ Raw API data stored in Zustand slices
- ❌ Hand-edits to files inside `src/components/ui/` (shadcn-generated)

---
