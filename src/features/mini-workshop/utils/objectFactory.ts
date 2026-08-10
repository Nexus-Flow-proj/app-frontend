import type { Task } from "@/features/boards/types";
import { MINI_CANVAS, MINI_NODE_SIZE } from "../constants/design";
import type {
  BoardTaskReferenceObject,
  CanvasPoint,
  FrameObject,
  ImageObject,
  MiniCanvasObject,
  MiniImageAsset,
  MiniObjectStyle,
  MiniShapeKind,
  PersonalTaskObject,
  ShapeObject,
  StickyNoteObject,
  TextObject,
} from "../types";
import type { PersonalTaskDto } from "../validation/personal-task.schema";

export function createMiniId(prefix = "mini") {
  return `${prefix}-${crypto.randomUUID()}`;
}

export const DEFAULT_STYLE: MiniObjectStyle = {
  fill: "#ffffff",
  stroke: "#94a3b8",
  strokeWidth: 2,
  opacity: 1,
  fontFamily: MINI_CANVAS.fontFamily,
  fontSize: 18,
  fontWeight: 500,
  textAlign: "center",
  textColor: "#1e293b",
};

function baseObject(
  point: CanvasPoint,
  zIndex: number,
  size: { width: number; height: number },
) {
  return {
    id: createMiniId("object"),
    x: point.x,
    y: point.y,
    width: size.width,
    height: size.height,
    rotation: 0,
    zIndex,
    groupId: null,
    locked: false,
  };
}

export function createShapeObject(
  point: CanvasPoint,
  shape: MiniShapeKind,
  zIndex: number,
): ShapeObject {
  return {
    ...baseObject(point, zIndex, MINI_NODE_SIZE.shape),
    type: "SHAPE",
    style: {
      ...DEFAULT_STYLE,
      fill: "#ede9fe",
      stroke: "#8b5cf6",
    },
    data: { shape, text: "" },
  };
}

export function createTextObject(point: CanvasPoint, zIndex: number): TextObject {
  return {
    ...baseObject(point, zIndex, MINI_NODE_SIZE.text),
    type: "TEXT",
    style: {
      ...DEFAULT_STYLE,
      fill: "transparent",
      stroke: "transparent",
      strokeWidth: 0,
      fontSize: 24,
      fontWeight: 600,
      textAlign: "left",
    },
    data: { text: "Double-click to edit" },
  };
}

export function createStickyObject(
  point: CanvasPoint,
  zIndex: number,
  color = "#fef3c7",
): StickyNoteObject {
  return {
    ...baseObject(point, zIndex, MINI_NODE_SIZE.sticky),
    type: "STICKY_NOTE",
    style: {
      ...DEFAULT_STYLE,
      fill: color,
      stroke: "#f59e0b",
      strokeWidth: 1,
      textAlign: "left",
      fontSize: 18,
    },
    data: { text: "Add your thought…" },
  };
}

export function createFrameObject(
  point: CanvasPoint,
  zIndex: number,
  title = "Planning area",
): FrameObject {
  return {
    ...baseObject(point, zIndex, MINI_NODE_SIZE.frame),
    type: "FRAME",
    style: {
      ...DEFAULT_STYLE,
      fill: "rgba(139, 92, 246, 0.04)",
      stroke: "#c4b5fd",
      strokeWidth: 2,
      dash: [10, 6],
      textAlign: "left",
    },
    data: { title, description: "" },
  };
}

export function createPersonalTaskObject(
  point: CanvasPoint,
  task: PersonalTaskDto,
  zIndex: number,
): PersonalTaskObject {
  return {
    ...baseObject(point, zIndex, MINI_NODE_SIZE.task),
    type: "PERSONAL_TASK",
    style: {
      ...DEFAULT_STYLE,
      fill: task.color,
      stroke: "#8b5cf6",
      strokeWidth: 1.5,
      textAlign: "left",
    },
    data: {
      title: task.title,
      description: task.description,
      completed: false,
    },
  };
}

export function createBoardTaskObject(
  point: CanvasPoint,
  task: Task,
  zIndex: number,
): BoardTaskReferenceObject {
  return {
    ...baseObject(point, zIndex, MINI_NODE_SIZE.task),
    type: "BOARD_TASK_REFERENCE",
    style: {
      ...DEFAULT_STYLE,
      fill: "#ffffff",
      stroke: "#c4b5fd",
      strokeWidth: 1.5,
      textAlign: "left",
    },
    data: {
      sourceTaskId: task.id,
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      assigneeName: task.assignee?.name,
      dueDate: task.dueDate,
    },
  };
}

export function createImageObject(
  point: CanvasPoint,
  asset: MiniImageAsset,
  zIndex: number,
): ImageObject {
  const maxWidth = MINI_NODE_SIZE.image.width;
  const ratio = asset.height / Math.max(asset.width, 1);
  return {
    ...baseObject(point, zIndex, {
      width: maxWidth,
      height: Math.max(120, Math.min(420, maxWidth * ratio)),
    }),
    type: "IMAGE",
    style: { ...DEFAULT_STYLE, fill: "#ffffff", stroke: "#cbd5e1", strokeWidth: 1 },
    data: { assetId: asset.id, alt: asset.name },
  };
}

export function objectText(object: MiniCanvasObject): string {
  switch (object.type) {
    case "SHAPE": return object.data.text ?? "";
    case "TEXT":
    case "STICKY_NOTE": return object.data.text;
    case "FRAME": return `${object.data.title} ${object.data.description ?? ""}`;
    case "PERSONAL_TASK": return `${object.data.title} ${object.data.description}`;
    case "BOARD_TASK_REFERENCE": return `${object.data.title} ${object.data.description}`;
    case "IMAGE": return object.data.alt;
    default: return "";
  }
}

