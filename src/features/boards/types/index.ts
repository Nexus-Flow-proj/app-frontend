import type { User } from "@/types/models/user";
import type { TaskPriority, TaskSource, TaskStatus } from "./enums";

export type Priority = TaskPriority;
export type ColumnId = string;
export type TaskId = string;

export interface PaginatedData {
  total: number;
  page: number;
  limit: number;
}

export interface BoardMember {
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface BoardColumn {
  id: ColumnId;
  projectId: string;
  name: string;
  sortOrder: number;
  isProtected: boolean;
  createdAt: string;
  color?: string;
}

export interface Task {
  id: TaskId;
  title: string;
  projectId: string;
  columnOrder: number;
  status: TaskStatus;
  priority: Priority;
  boardColumnId?: ColumnId;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  assignee?: BoardMember | null;
  commentsCount?: number;
  subtasksCount?: number;
  attachmentsCount?: number;
  completedSubtasksCount?: number;
  source: TaskSource;
  description?: string;
  dueDate?: string;
  durationMin?: number;
  tags?: string[];
}
export interface TaskList extends PaginatedData {
  tasks: Task[];
}

export interface TaskAttachment {
  id: string;
  taskId: TaskId;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: Pick<User, "id" | "name" | "avatar">;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: TaskId;
  title: string;
  completed: boolean;
  assigneeId?: string;
  assignee?: Pick<User, "id" | "name" | "avatar">;
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: TaskId;
  authorId?: string;
  author: BoardMember | Pick<User, "id" | "name" | "avatar">;
  content: string;
  editedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentList extends PaginatedData {
  comments: Comment[];
}

export interface ActivityEvent {
  id: string;
  actor: BoardMember | Pick<User, "id" | "name" | "avatar">;
  action: string;
  createdAt: string;
}

export interface TaskDetail extends Task {
  subtasks: Subtask[];
  comments: Comment[];
  activityLog: ActivityEvent[];
  attachments: TaskAttachment[];
}

export interface BoardState {
  columns: Record<ColumnId, BoardColumn>;
  tasks: Record<ColumnId, Task[]>;
  taskIdsByColumn?: Record<ColumnId, TaskId[]>;
  columnOrder: ColumnId[];
}

export interface MoveTaskDto {
  taskId: TaskId;
  sourceColumnId: ColumnId;
  targetColumnId: ColumnId;
  newPositionFloat: number;
}

export interface MoveColumnDto {
  columnId: ColumnId;
  newPositionFloat: number;
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

export interface UpdateCommentDto {
  content: string;
}

export interface TimeLog {
  id: string;
  taskId: TaskId;
  userId: string;
  user?: Pick<User, "id" | "name" | "avatar">;
  minutes: number;
  description?: string;
  loggedAt: string;
  createdAt: string;
}
export interface TimeLogList extends PaginatedData {
  timeLogs: TimeLog[];
}

export interface CreateTimeLogDto {
  taskId: TaskId;
  minutes: number;
  description?: string;
  loggedAt?: string;
}

export type MoveTaskFn = (
  taskId: TaskId,
  sourceColId: ColumnId,
  targetColId: ColumnId,
  newPositionFloat: number,
) => void;

export type MoveColumnFn = (
  columnId: ColumnId,
  newPositionFloat: number,
) => void;

export interface BoardFiltersState {
  search: string;
  priorities: Priority[];
  assigneeIds: string[];
  dueDateRange: "overdue" | "today" | "this_week" | null;
  showOnlyMyTasks: boolean;
}
