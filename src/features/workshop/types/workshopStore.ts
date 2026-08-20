import type {
  CanvasViewport,
  CanvasObject,
  WorkshopTool,
  WorkshopSnapshot,
} from ".";

export interface WorkshopStore {
  // Canvas data (persisted)
  canvasId: Nullable<string>;
  objects: CanvasObject[];
  viewport: CanvasViewport;

  // UI state (never persisted)
  activeTool: WorkshopTool;
  selectedObjectId: Nullable<string>;
  detailsObjectId: Nullable<string>;
  hoveredObjectId: Nullable<string>;
  isDirty: boolean;

  // Undo / redo
  undoStack: WorkshopSnapshot[];
  redoStack: WorkshopSnapshot[];
}
