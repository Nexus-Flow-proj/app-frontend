import {
  CanvasObjectType,
  CanvasType,
  TaskPriority,
  TaskStatus,
} from "../enums";

export interface Canvas {
  id: string;
  projectId: string;
  type: CanvasType;
  userId?: string;
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasViewport {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  data: CanvasObjectData;
}

export type CanvasObjectData =
  | TaskCardData
  | StickyNoteData
  | ImageBlockData
  | SectionFrameData
  | SubtaskCardData;

export interface TaskCardData {
  taskId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeAvatar?: string;
  assigneeName?: string;
}

export interface StickyNoteData {
  content: string;
  color: string;
  fontSize: number;
}

export interface ImageBlockData {
  url: string;
  alt?: string;
}

export interface SectionFrameData {
  title: string;
  backgroundColor: string;
  borderColor: string;
}

export interface SubtaskCardData {
  subtaskId: string;
  title: string;
  completed: boolean;
}

export interface CanvasConnection {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  label?: string;
  style: ConnectionStyle;
}

export interface ConnectionStyle {
  color: string;
  strokeWidth: number;
  dashed: boolean;
  arrowEnd: boolean;
}
