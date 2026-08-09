export type MiniObjectType =
  | "SHAPE"
  | "TEXT"
  | "STICKY_NOTE"
  | "IMAGE"
  | "FRAME"
  | "FREEHAND"
  | "PERSONAL_TASK"
  | "BOARD_TASK_REFERENCE";

export type MiniShapeKind =
  | "rectangle"
  | "rounded-rectangle"
  | "ellipse"
  | "diamond"
  | "triangle";

export type MiniTool =
  | "select"
  | "pan"
  | "freehand"
  | "eraser"
  | "shape"
  | "connector"
  | "text"
  | "sticky"
  | "frame"
  | "image"
  | "task";

export type ConnectorRouting = "straight" | "curved" | "elbow";
export type ConnectorAnchor = "auto" | "top" | "right" | "bottom" | "left";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface MiniViewport {
  x: number;
  y: number;
  scale: number;
}

export interface MiniObjectStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  dash?: number[];
  fontFamily?: "Geist Variable";
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
}

interface BaseMiniCanvasObject {
  id: string;
  type: MiniObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  groupId: string | null;
  locked: boolean;
  style: MiniObjectStyle;
}

export interface ShapeObject extends BaseMiniCanvasObject {
  type: "SHAPE";
  data: { shape: MiniShapeKind; text?: string };
}

export interface TextObject extends BaseMiniCanvasObject {
  type: "TEXT";
  data: { text: string };
}

export interface StickyNoteObject extends BaseMiniCanvasObject {
  type: "STICKY_NOTE";
  data: { text: string };
}

export interface ImageObject extends BaseMiniCanvasObject {
  type: "IMAGE";
  data: { assetId: string; alt: string };
}

export interface FrameObject extends BaseMiniCanvasObject {
  type: "FRAME";
  data: { title: string; description?: string };
}

export interface FreehandObject extends BaseMiniCanvasObject {
  type: "FREEHAND";
  data: { points: number[][] };
}

export interface PersonalTaskObject extends BaseMiniCanvasObject {
  type: "PERSONAL_TASK";
  data: {
    title: string;
    description: string;
    completed: boolean;
  };
}

export interface BoardTaskReferenceObject extends BaseMiniCanvasObject {
  type: "BOARD_TASK_REFERENCE";
  data: {
    sourceTaskId: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    assigneeName?: string;
    dueDate?: string;
    unavailable?: boolean;
  };
}

export type MiniCanvasObject =
  | ShapeObject
  | TextObject
  | StickyNoteObject
  | ImageObject
  | FrameObject
  | FreehandObject
  | PersonalTaskObject
  | BoardTaskReferenceObject;

export interface MiniConnection {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  sourceAnchor: ConnectorAnchor;
  targetAnchor: ConnectorAnchor;
  routing: ConnectorRouting;
  label: string;
  stroke: string;
  strokeWidth: number;
  dash?: number[];
}

export interface MiniImageAsset {
  id: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export interface MiniWorkshopScene {
  viewport: MiniViewport;
  objects: MiniCanvasObject[];
  connections: MiniConnection[];
  assets: Record<string, MiniImageAsset>;
}

export interface MiniWorkshopDocument {
  id: string | null;
  projectId: string;
  ownerId: string | null;
  schemaVersion: 2;
  revision: number;
  scene: MiniWorkshopScene;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SaveMiniWorkshopDto {
  schemaVersion: 2;
  revision: number;
  scene: MiniWorkshopScene;
}

export interface WhiteboardTemplate {
  id: string;
  name: string;
  description: string;
  category: "Plan" | "Explore" | "Analyze";
  accent: string;
  build: (origin: CanvasPoint) => Pick<MiniWorkshopScene, "objects" | "connections">;
}

export type SelectionAlignment =
  | "left"
  | "center-horizontal"
  | "right"
  | "top"
  | "center-vertical"
  | "bottom";
