import type {
  CanvasConnection,
  CanvasViewport,
  CanvasObject,
  WorkshopTool,
  WorkshopSnapshot,
} from ".";

export interface WorkshopStore {
  // Canvas data (persisted)
  canvasId: Nullable<string>;
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;

  // UI state (never persisted)
  activeTool: WorkshopTool;
  selectedObjectId: Nullable<string>;
  detailsObjectId: Nullable<string>;
  hoveredObjectId: Nullable<string>;
  isConnecting: boolean;
  connectFromId: Nullable<string>;
  isDirty: boolean;

  // Undo / redo
  undoStack: WorkshopSnapshot[];
  redoStack: WorkshopSnapshot[];
}
