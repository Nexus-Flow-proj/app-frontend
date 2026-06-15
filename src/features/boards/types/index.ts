import type { User } from "@/types/models/user";
import type { TaskPriority, TaskSource, TaskStatus } from "./enums";

export interface BoardColumn {
  id: string; // uuid
  projectId: string; // uuid
  name: string; // text
  sortOrder: number; // int/float used for sorting columns horizontally
  isProtected: boolean; // bool
  createdAt: string;
}
export interface ColumnProps {
  column: BoardColumn;
  tasks: TaskCard[];
}

export interface TaskCard {
  id: string; // uuid
  projectId: string; // uuid
  createdBy: string; // uuid
  title: string; // text
  description?: string; // text?
  status: TaskStatus; // enum matching your schema
  priority: TaskPriority; // enum
  dueDate?: string; // date?
  durationMin?: number; // int?
  boardColumnId?: string; // uuid? (Foreign Key to board_column)
  columnOrder: number; // int/float used for sorting tasks vertically within a column
  source: TaskSource; // enum
  createdAt: string;
}
export interface CardProps {
  task: TaskCard;
}
export interface TaskAttachment {
  id: string;
  taskId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: Pick<User, "id" | "name" | "avatar">;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  assignee?: Pick<User, "id" | "name" | "avatar">;
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  author: Pick<User, "id" | "name" | "avatar">;
  content: string;
  editedAt?: string;
  createdAt: string;
}

export interface KanbanBoardState {
  columns: Record<string, BoardColumn>;
  tasks: Record<string, TaskCard[]>; // Keyed by boardColumnId, array of tasks in that column
  taskIdsByColumn?: Record<string, string[]>; // Keyed by boardColumnId, array of taskIds in order
}

export type MoveTaskFn = (
  taskId: string,
  sourceColId: string,
  targetColId: string,
  newPositionFloat: number,
) => void;

export type MoveColumnFn = (columnId: string, newPositionFloat: number) => void;
