import { TaskPriority, TaskStatus, TaskType } from "../enums";
import type { User } from "./user";

export interface Task {
  id: string;
  projectId: string;
  boardColumnId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  assignee?: User;
  reporterId: string;
  reporter: User;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  tags: string[];
  position: number;
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  attachmentCount: number;
  canvasObjectId?: string;
  createdAt: string;
  updatedAt: string;
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

export interface BoardColumn {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  position: number;
  isProtected: boolean;
  taskCount: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}
