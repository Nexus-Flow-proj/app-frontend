import type { TaskStatus, TaskPriority } from "@/types/enums";
import type {
  SectionFrameKind,
  StickyNoteKind,
  TaskCardKind,
} from "@/features/workshop/types/workshopKinds";

export type CanvasObjectData =
  | TaskCardData
  | StickyNoteData
  | ImageBlockData
  | SectionFrameData
  | SubtaskCardData;

export interface TaskCardData {
  taskId: string;
  kind: TaskCardKind;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeAvatar?: string;
  assigneeName?: string;
  dueDate?: string;
  category?: string;
}

export interface StickyNoteData {
  kind: StickyNoteKind;
  content: string;
  color: string;
  fontSize: number;
}

export interface ImageBlockData {
  url: string;
  alt?: string;
}

export interface SectionFrameData {
  kind: SectionFrameKind;
  title: string;
  description?: string;
  backgroundColor: string;
  borderColor: string;
}

export interface SubtaskCardData {
  subtaskId: string;
  title: string;
  completed: boolean;
}
