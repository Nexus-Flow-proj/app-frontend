import type { CanvasObjectType, TaskStatus, CanvasType } from "@/types/enums";
import type { CanvasObjectData } from "./canvasObjectData";

export * from "./canvasObjectData";
export * from "./workshopKinds";
export * from "./workshopDto";
export * from "./workshopStore";

export interface Canvas {
  id: string;
  projectId: string;
  type: CanvasType;
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
  createdAt: string;
  updatedAt: string;
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

export interface CanvasViewport {
  x: number; // how far canvas is panned horizontally
  y: number; // how far canvas is panned vertically
  scale: number; // current zoom level
}

// ─── Active tool in the toolbar (UI state only) ───────────────
export type WorkshopTool =
  | "select" // default: move + resize + click
  | "pan" // hand tool: pan canvas without selecting
  | "task" // click canvas to place a TaskCard
  | "sticky" // click canvas to place a StickyNote
  | "section" // drag canvas to draw a SectionFrame
  | "connect"; // click a source node then a target to draw an edge

// ─── Undo / redo snapshot ─────────────────────────────────────
// viewport is not included. Undo/redo only affects canvas content, not camera position.
export interface WorkshopSnapshot {
  objects: CanvasObject[];
  connections: CanvasConnection[];
}

// ─── Sidebar filter state ─────────────────────────────────────
export interface WorkshopFilters {
  search: string;
  type: CanvasObjectType | "ALL";
  status: TaskStatus | "ALL";
}
