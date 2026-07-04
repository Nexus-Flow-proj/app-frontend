import type { TaskStatus, TaskPriority } from "@/types/enums";

export interface CreateTaskCardPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  position: { x: number; y: number };
}

export interface UpdateTaskCardPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface CreateStickyNotePayload {
  content: string;
  color: string;
  position: { x: number; y: number };
}

export interface CreateSectionFramePayload {
  title: string;
  backgroundColor: string;
  borderColor: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}
