// features/boards/types/index.ts
// ─── Day-1 locked contract — all 4 devs depend on this ───────────────────────

export type Priority = "low" | "medium" | "high" | "urgent";
export type ColumnId = string;
export type TaskId = string;

export interface BoardMember {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface BoardColumn {
  id: ColumnId;
  projectId: string;
  title: string;
  sort_order: number;
  taskIds: TaskId[];
  color?: string;
  isProtected?: boolean;
}

export interface Task {
  id: TaskId;
  columnId: ColumnId;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  sort_order: number;
  assignee: BoardMember | null;
  dueDate: string | null;
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  attachmentCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: TaskId;
  title: string;
  completed: boolean;
  sort_order: number;
}

export interface Comment {
  id: string;
  taskId: TaskId;
  author: BoardMember;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  actor: BoardMember;
  action: string;
  createdAt: string;
}

export interface TaskDetail extends Task {
  subtasks: Subtask[];
  comments: Comment[];
  activityLog: ActivityEvent[];
}

export interface BoardState {
  columns: Record<ColumnId, BoardColumn>;
  tasks: Record<TaskId, Task>;
  columnOrder: ColumnId[];
}

export interface MoveTaskDto {
  taskId: TaskId;
  targetColumnId: ColumnId;
  newSortOrder: number;
}

export interface CreateTaskDto {
  columnId: ColumnId;
  title: string;
  priority?: Priority;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface CreateSubtaskDto {
  taskId: TaskId;
  title: string;
}

export interface CreateCommentDto {
  taskId: TaskId;
  content: string;
}

export interface BoardFiltersState {
  search: string;
  priorities: Priority[];
  assigneeIds: string[];
  dueDateRange: "overdue" | "today" | "this_week" | null;
  showOnlyMyTasks: boolean;
}
