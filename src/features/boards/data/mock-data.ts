import type {
  BoardMember,
  BoardState,
  Task,
  TaskDetail,
  Subtask,
  Comment,
  ActivityEvent,
} from "../types";
import { TaskPriority, TaskSource, TaskStatus } from "../types/enums";

export const CURRENT_USER: BoardMember = {
  id: "u1",
  name: "Ahmed Hassan",
  avatarUrl: "https://github.com/shadcn.png",
  avatar: "https://github.com/shadcn.png",
  isActive: true,
};

export const MOCK_MEMBERS: BoardMember[] = [
  CURRENT_USER,
  {
    id: "u2",
    name: "Sara Ramadan",
    avatarUrl: "https://github.com/leerob.png",
    avatar: "https://github.com/leerob.png",
    isActive: false,
  },
  { id: "u3", name: "Karim Mostafa", isActive: true },
  { id: "u4", name: "Lina Nasser", isActive: false },
];

const TODAY = new Date().toISOString().slice(0, 10);
const PROJECT_ID = "p1";

// ─── Single source of truth ───────────────────────────────────────────────────
// Subtasks/comments/activity live HERE. Task card counts (subtasksCount,
// commentsCount, …) are derived from these arrays below — so the board and
// the drawer can never go out of sync again.

const SUBTASKS_BY_TASK: Record<string, Omit<Subtask, "taskId">[]> = {
  t1: [
    {
      id: "s-t1-1",
      title: "Define primary/secondary color tokens",
      completed: true,
      position: 1,
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z",
    },
    {
      id: "s-t1-2",
      title: "Pick type scale (xs → 3xl)",
      completed: false,
      position: 2,
      createdAt: "2026-06-01T10:10:00.000Z",
      updatedAt: "2026-06-01T10:10:00.000Z",
    },
    {
      id: "s-t1-3",
      title: "Wire tokens into tailwind.config",
      completed: false,
      position: 3,
      createdAt: "2026-06-01T10:20:00.000Z",
      updatedAt: "2026-06-01T10:20:00.000Z",
    },
    {
      id: "s-t1-4",
      title: "Document usage in Storybook",
      completed: false,
      position: 4,
      createdAt: "2026-06-01T10:30:00.000Z",
      updatedAt: "2026-06-01T10:30:00.000Z",
    },
  ],
  t4: [
    {
      id: "s1",
      title: "Update axios.ts and remove Bearer interceptor",
      completed: true,
      position: 1,
      createdAt: "2026-06-04T10:00:00.000Z",
      updatedAt: "2026-06-04T10:00:00.000Z",
    },
    {
      id: "s2",
      title: "Simplify authStore.setAuth to user only",
      completed: true,
      position: 2,
      createdAt: "2026-06-04T10:30:00.000Z",
      updatedAt: "2026-06-04T10:30:00.000Z",
    },
    {
      id: "s3",
      title: "Remove accessToken from authService types",
      completed: false,
      position: 3,
      createdAt: "2026-06-04T11:00:00.000Z",
      updatedAt: "2026-06-04T11:00:00.000Z",
    },
  ],
  t5: [
    {
      id: "s-t5-1",
      title: "Pan + zoom with wheel/trackpad",
      completed: true,
      position: 1,
      createdAt: "2026-06-05T09:00:00.000Z",
      updatedAt: "2026-06-05T09:00:00.000Z",
    },
    {
      id: "s-t5-2",
      title: "Snap-to-grid on drag end",
      completed: true,
      position: 2,
      createdAt: "2026-06-05T09:20:00.000Z",
      updatedAt: "2026-06-05T09:20:00.000Z",
    },
    {
      id: "s-t5-3",
      title: "Multi-select with marquee",
      completed: false,
      position: 3,
      createdAt: "2026-06-05T09:40:00.000Z",
      updatedAt: "2026-06-05T09:40:00.000Z",
    },
    {
      id: "s-t5-4",
      title: "Keyboard nudge (arrow keys)",
      completed: false,
      position: 4,
      createdAt: "2026-06-05T10:00:00.000Z",
      updatedAt: "2026-06-05T10:00:00.000Z",
    },
    {
      id: "s-t5-5",
      title: "Export canvas as PNG",
      completed: false,
      position: 5,
      createdAt: "2026-06-05T10:20:00.000Z",
      updatedAt: "2026-06-05T10:20:00.000Z",
    },
  ],
  t6: [
    {
      id: "s-t6-1",
      title: "Login form + zod schema",
      completed: true,
      position: 1,
      createdAt: "2026-06-06T09:00:00.000Z",
      updatedAt: "2026-06-06T09:00:00.000Z",
    },
    {
      id: "s-t6-2",
      title: "Register form + zod schema",
      completed: true,
      position: 2,
      createdAt: "2026-06-06T09:10:00.000Z",
      updatedAt: "2026-06-06T09:10:00.000Z",
    },
    {
      id: "s-t6-3",
      title: "Inline error states",
      completed: true,
      position: 3,
      createdAt: "2026-06-06T09:20:00.000Z",
      updatedAt: "2026-06-06T09:20:00.000Z",
    },
    {
      id: "s-t6-4",
      title: "Success/error toasts",
      completed: true,
      position: 4,
      createdAt: "2026-06-06T09:30:00.000Z",
      updatedAt: "2026-06-06T09:30:00.000Z",
    },
  ],
};

const COMMENTS_BY_TASK: Record<string, Omit<Comment, "taskId">[]> = {
  t1: [
    {
      id: "c-t1-1",
      authorId: MOCK_MEMBERS[1].id,
      author: MOCK_MEMBERS[1],
      content: "Let's keep the type scale to 6 steps max.",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t1-2",
      authorId: MOCK_MEMBERS[0].id,
      author: MOCK_MEMBERS[0],
      content: "Agreed, pushed the first pass of tokens.",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      updatedAt: "",
    },
  ],
  t3: [
    {
      id: "c-t3-1",
      authorId: MOCK_MEMBERS[0].id,
      author: MOCK_MEMBERS[0],
      content: "Draft is in Notion, link is in the description.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: "",
    },
  ],
  t4: [
    {
      id: "c1",
      authorId: MOCK_MEMBERS[0].id,
      author: MOCK_MEMBERS[0],
      content: "Finished the axios interceptor. Moving to authStore now.",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c2",
      authorId: MOCK_MEMBERS[1].id,
      author: MOCK_MEMBERS[1],
      content: "Check header name with the backend team.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: "",
    },
  ],
  t5: [
    {
      id: "c-t5-1",
      authorId: MOCK_MEMBERS[1].id,
      author: MOCK_MEMBERS[1],
      content: "Snap-to-grid feels great, nice work.",
      createdAt: new Date(Date.now() - 9 * 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t5-2",
      authorId: MOCK_MEMBERS[0].id,
      author: MOCK_MEMBERS[0],
      content: "Marquee select is next, should land tomorrow.",
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t5-3",
      authorId: MOCK_MEMBERS[2].id,
      author: MOCK_MEMBERS[2],
      content: "Can we also support pinch-to-zoom on trackpad?",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: "",
    },
  ],
  t6: [
    {
      id: "c-t6-1",
      authorId: MOCK_MEMBERS[3].id,
      author: MOCK_MEMBERS[3],
      content: "Tested both forms, validation looks solid.",
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t6-2",
      authorId: MOCK_MEMBERS[0].id,
      author: MOCK_MEMBERS[0],
      content: "Thanks! Added a loading state on submit too.",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t6-3",
      authorId: MOCK_MEMBERS[2].id,
      author: MOCK_MEMBERS[2],
      content: "LGTM, approving.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t6-4",
      authorId: MOCK_MEMBERS[1].id,
      author: MOCK_MEMBERS[1],
      content: "One nit on the password field width, fixed.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: "",
    },
  ],
  t7: [
    {
      id: "c-t7-1",
      authorId: MOCK_MEMBERS[3].id,
      author: MOCK_MEMBERS[3],
      content: "Using recharts for the bar chart, WIP.",
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      updatedAt: "",
    },
    {
      id: "c-t7-2",
      authorId: MOCK_MEMBERS[0].id,
      author: MOCK_MEMBERS[0],
      content: "Sounds good, keep the colors on-brand.",
      createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      updatedAt: "",
    },
  ],
};

const ACTIVITY_BY_TASK: Record<string, Omit<ActivityEvent, "id">[]> = {
  t4: [
    {
      actor: MOCK_MEMBERS[0],
      action: "moved this card to In Progress",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  t6: [
    {
      actor: MOCK_MEMBERS[0],
      action: "moved this card to In Review",
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ],
};

let activityIdCounter = 0;

function buildActivityLog(taskId: string): ActivityEvent[] {
  return (ACTIVITY_BY_TASK[taskId] ?? []).map((event) => ({
    ...event,
    id: `a-${taskId}-${activityIdCounter++}`,
  }));
}

function buildSubtasks(taskId: string): Subtask[] {
  return (SUBTASKS_BY_TASK[taskId] ?? []).map((s) => ({ ...s, taskId }));
}

function buildComments(taskId: string): Comment[] {
  return (COMMENTS_BY_TASK[taskId] ?? []).map((c) => ({ ...c, taskId }));
}

// ─── Task cards — counts are derived, never hand-typed ───────────────────────
type TaskInput = Omit<
  Task,
  "dependencyIds" | "subtasksCount" | "completedSubtasksCount" | "commentsCount"
> &
  Partial<Pick<Task, "dependencyIds">>;

const createTask = (task: TaskInput): Task => {
  const subtasks = buildSubtasks(task.id);
  const comments = buildComments(task.id);

  return {
    dependencyIds: [],
    ...task,
    subtasksCount: subtasks.length,
    completedSubtasksCount: subtasks.filter((s) => s.completed).length,
    commentsCount: comments.length,
  };
};

const backlogTasks = [
  createTask({
    id: "t1",
    projectId: PROJECT_ID,
    createdBy: "u1",
    title: "Define color tokens and typography scale",
    description: "Establish all Tailwind CSS theme extensions.",
    status: TaskStatus.BACKLOG,
    priority: TaskPriority.LOW,
    dueDate: "2026-06-20",
    boardColumnId: "col1",
    columnOrder: 1,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-01T09:00:00.000Z",
    assignee: MOCK_MEMBERS[1],
    attachmentsCount: 0,
    tags: ["design"],
  }),
  createTask({
    id: "t2",
    projectId: PROJECT_ID,
    createdBy: "u2",
    title: "Set up PostgreSQL schema for projects",
    description: "",
    status: TaskStatus.BACKLOG,
    priority: TaskPriority.MEDIUM,
    dueDate: "2026-06-25",
    boardColumnId: "col1",
    columnOrder: 2,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-02T09:00:00.000Z",
    assignee: MOCK_MEMBERS[2],
    attachmentsCount: 1,
    tags: ["backend"],
  }),
  createTask({
    id: "t3",
    projectId: PROJECT_ID,
    createdBy: "u1",
    title: "Write onboarding docs for new members",
    description: "",
    status: TaskStatus.BACKLOG,
    priority: TaskPriority.LOW,
    dueDate: "2026-06-30",
    boardColumnId: "col1",
    columnOrder: 3,
    source: TaskSource.AI,
    createdAt: "2026-06-03T09:00:00.000Z",
    assignee: MOCK_MEMBERS[0],
    attachmentsCount: 0,
    tags: [],
  }),
];

const inProgressTasks = [
  createTask({
    id: "t4",
    projectId: PROJECT_ID,
    createdBy: "u1",
    title: "Implement HTTP-only cookie auth with CSRF interceptor",
    description:
      "Migration from in-memory Bearer tokens to HTTP-only cookies.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    dueDate: TODAY,
    boardColumnId: "col2",
    columnOrder: 1,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-04T09:00:00.000Z",
    assignee: MOCK_MEMBERS[0],
    attachmentsCount: 0,
    tags: ["auth"],
  }),
  createTask({
    id: "t5",
    projectId: PROJECT_ID,
    createdBy: "u2",
    title: "Build Konva infinite canvas with pan, zoom and snap",
    description: "Main Workshop using react-konva.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: "2026-06-17",
    boardColumnId: "col2",
    columnOrder: 2,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-05T09:00:00.000Z",
    assignee: MOCK_MEMBERS[1],
    attachmentsCount: 0,
    tags: ["canvas"],
  }),
];

const reviewTasks = [
  createTask({
    id: "t6",
    projectId: PROJECT_ID,
    createdBy: "u1",
    title: "Login and registration forms with zod validation",
    description: "Forms complete with error states and toasts.",
    status: TaskStatus.IN_REVIEW,
    priority: TaskPriority.HIGH,
    boardColumnId: "col3",
    columnOrder: 1,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-06T09:00:00.000Z",
    assignee: MOCK_MEMBERS[0],
    attachmentsCount: 1,
    tags: ["auth"],
  }),
  createTask({
    id: "t7",
    projectId: PROJECT_ID,
    createdBy: "u4",
    title: "Dashboard analytics tasks bar chart",
    description: "",
    status: TaskStatus.IN_REVIEW,
    priority: TaskPriority.MEDIUM,
    dueDate: "2026-06-16",
    boardColumnId: "col3",
    columnOrder: 2,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-07T09:00:00.000Z",
    assignee: MOCK_MEMBERS[3],
    attachmentsCount: 0,
    tags: ["dashboard"],
  }),
];

const doneTasks = [
  createTask({
    id: "t8",
    projectId: PROJECT_ID,
    createdBy: "u1",
    title: "Configure Vite + TypeScript + Tailwind scaffold",
    description: "",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    boardColumnId: "col4",
    columnOrder: 1,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-08T09:00:00.000Z",
    assignee: MOCK_MEMBERS[0],
    attachmentsCount: 0,
    tags: ["infra"],
  }),
  createTask({
    id: "t9",
    projectId: PROJECT_ID,
    createdBy: "u3",
    title: "Set up React Router with auth guard and RBAC",
    description: "",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    boardColumnId: "col4",
    columnOrder: 2,
    source: TaskSource.MANUAL,
    createdAt: "2026-06-09T09:00:00.000Z",
    assignee: MOCK_MEMBERS[2],
    attachmentsCount: 0,
    tags: ["routing"],
  }),
];

export const MOCK_BOARD: BoardState = {
  columnOrder: ["col1", "col2", "col3", "col4"],
  columns: {
    col1: {
      id: "col1",
      projectId: PROJECT_ID,
      name: "Backlog",
      sortOrder: 1,
      isProtected: true,
      createdAt: "2026-06-01T08:00:00.000Z",
    },
    col2: {
      id: "col2",
      projectId: PROJECT_ID,
      name: "In Progress",
      sortOrder: 2,
      isProtected: false,
      createdAt: "2026-06-01T08:00:00.000Z",
    },
    col3: {
      id: "col3",
      projectId: PROJECT_ID,
      name: "In Review",
      sortOrder: 3,
      isProtected: false,
      createdAt: "2026-06-01T08:00:00.000Z",
    },
    col4: {
      id: "col4",
      projectId: PROJECT_ID,
      name: "Done",
      sortOrder: 4,
      isProtected: true,
      createdAt: "2026-06-01T08:00:00.000Z",
    },
  },
  tasks: {
    col1: backlogTasks,
    col2: inProgressTasks,
    col3: reviewTasks,
    col4: doneTasks,
  },
};

export const MOCK_TASKS_BY_ID: Record<string, Task> = Object.values(
  MOCK_BOARD.tasks,
)
  .flat()
  .reduce<Record<string, Task>>((tasksById, task) => {
    tasksById[task.id] = task;
    return tasksById;
  }, {});

// Built for EVERY task (not just t4) from the same subtasks/comments/activity
// data the cards' counts came from — so opening the drawer always matches
// what the board already showed.
export const MOCK_TASK_DETAIL: Partial<Record<string, TaskDetail>> =
  Object.values(MOCK_TASKS_BY_ID).reduce<
    Partial<Record<string, TaskDetail>>
  >((acc, task) => {
    acc[task.id] = {
      ...task,
      subtasks: buildSubtasks(task.id),
      comments: buildComments(task.id),
      activityLog: buildActivityLog(task.id),
      attachments: [],
    };
    return acc;
  }, {});
