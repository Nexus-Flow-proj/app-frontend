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
  taskId?: string;
  featureId?: string;
  kind: TaskCardKind;
  title: string;
  description?: string;
  dueDate?: string;
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
  boardColumnId?: string;
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
