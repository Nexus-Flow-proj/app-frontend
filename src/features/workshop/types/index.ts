import type { CanvasObjectType, TaskStatus, CanvasType } from "@/types/enums";
import type { CanvasObjectData } from "./canvasObjectData";
import type { User } from "@/types";

export * from "./canvasObjectData";
export * from "./workshopKinds";
export * from "./workshopDto";
export * from "./workshopStore";

export interface Canvas {
  id: string;
  draftId?: string;
  projectId?: string;
  owner?: User;
  type?: CanvasType;
  objects: CanvasObject[];
  viewport: CanvasViewport;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasObject {
  id: string;
  workshopId?: string;
  parentFrameId?: string | null;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  data: CanvasObjectData;
  createdAt?: string;
  updatedAt?: string;
}

export interface CanvasViewport {
  x: number; // how far canvas is panned horizontally
  y: number; // how far canvas is panned vertically
  scale: number; // current zoom level
}

// ─── Active tool in the toolbar (UI state only) ───────────────
export type WorkshopTool =
  | "select" // default: move, select, and open details
  | "pan" // hand tool: pan canvas without selecting
  | "task" // click canvas to place a TaskCard
  | "sticky" // click canvas to place a StickyNote
  | "text" // click canvas to place a TextBox
  | "section"; // drag canvas to draw a SectionFrame

// ─── Undo / redo snapshot ─────────────────────────────────────
// viewport is not included. Undo/redo only affects canvas content, not camera position.
export interface WorkshopSnapshot {
  objects: CanvasObject[];
}

export interface WorkshopCanvasResponseDto {
  id: string;
  draftId: string;
  viewportX?: number;
  viewportY?: number;
  zoomLevel?: number;
  viewport?: CanvasViewport;
  objects: WorkshopObjectDto[];
  connections: WorkshopConnectionDto[];
}

export interface WorkshopObjectDto {
  id: string;
  workshopId?: string;
  parentFrameId?: string | null;
  type: CanvasObjectType;
  x: number;
  y: number;
  /** Legacy coordinate names kept only for backward-compatible reads. */
  positionX?: number;
  positionY?: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkshopConnectionDto {
  id: string;
  workshopId?: string;
  fromObjectId: string;
  toObjectId: string;
  label?: string | null;
  type?: string | null;
}

export interface SaveWorkshopDto {
  viewport: CanvasViewport;
  objects: WorkshopObjectDto[];
  connections: WorkshopConnectionDto[];
}

export type AiGenerationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface AiGeneration {
  id?: string;
  generationId?: string;
  status: AiGenerationStatus;
  output?: Record<string, unknown>;
  outputSnapshot?: Record<string, unknown> | null;
  error?: string;
  errorMessage?: string | null;
}

export interface AiMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface AiGenerationEvent extends AiGeneration {
  stage?: string;
  progressMessage?: string;
  progressPercent?: number;
  workshop?: WorkshopCanvasResponseDto;
}

export interface SubmitOnboardingResult {
  projectId: string;
  projectName?: string;
  boardColumns?: Array<{ columnId: string; name: string; taskCount: number }>;
  taskCount?: number;
}

// ─── Sidebar filter state ─────────────────────────────────────
export interface WorkshopFilters {
  search: string;
  type: CanvasObjectType | "ALL";
  status: TaskStatus | "ALL";
}
