import { MINI_CANVAS } from "../constants/design";
import type {
  CanvasPoint,
  ConnectorAnchor,
  ConnectorRouting,
  MiniCanvasObject,
  MiniViewport,
} from "../types";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function objectBounds(object: MiniCanvasObject): Bounds {
  return { x: object.x, y: object.y, width: object.width, height: object.height };
}

export function combinedBounds(objects: MiniCanvasObject[]): Bounds | null {
  if (objects.length === 0) return null;
  const left = Math.min(...objects.map((object) => object.x));
  const top = Math.min(...objects.map((object) => object.y));
  const right = Math.max(...objects.map((object) => object.x + object.width));
  const bottom = Math.max(...objects.map((object) => object.y + object.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function snapValue(value: number, enabled = true) {
  return enabled ? Math.round(value / MINI_CANVAS.gridSize) * MINI_CANVAS.gridSize : value;
}

export function screenToCanvas(point: CanvasPoint, viewport: MiniViewport): CanvasPoint {
  return {
    x: (point.x - viewport.x) / viewport.scale,
    y: (point.y - viewport.y) / viewport.scale,
  };
}

export function viewportBounds(
  width: number,
  height: number,
  viewport: MiniViewport,
  overscan: number = MINI_CANVAS.overscan,
): Bounds {
  return {
    x: (-viewport.x / viewport.scale || 0) - overscan,
    y: (-viewport.y / viewport.scale || 0) - overscan,
    width: width / viewport.scale + overscan * 2,
    height: height / viewport.scale + overscan * 2,
  };
}

export function intersects(a: Bounds, b: Bounds) {
  return a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y;
}

function explicitAnchor(object: MiniCanvasObject, anchor: Exclude<ConnectorAnchor, "auto">): CanvasPoint {
  if (anchor === "top") return { x: object.x + object.width / 2, y: object.y };
  if (anchor === "right") return { x: object.x + object.width, y: object.y + object.height / 2 };
  if (anchor === "bottom") return { x: object.x + object.width / 2, y: object.y + object.height };
  return { x: object.x, y: object.y + object.height / 2 };
}

export function nearestAnchor(
  object: MiniCanvasObject,
  toward: CanvasPoint,
  anchor: ConnectorAnchor,
): CanvasPoint {
  if (anchor !== "auto") return explicitAnchor(object, anchor);
  const anchors = (["top", "right", "bottom", "left"] as const)
    .map((side) => explicitAnchor(object, side));
  return anchors.reduce((best, current) => {
    const currentDistance = Math.hypot(current.x - toward.x, current.y - toward.y);
    const bestDistance = Math.hypot(best.x - toward.x, best.y - toward.y);
    return currentDistance < bestDistance ? current : best;
  });
}

export function connectorPoints(
  source: MiniCanvasObject,
  target: MiniCanvasObject,
  sourceAnchor: ConnectorAnchor,
  targetAnchor: ConnectorAnchor,
  routing: ConnectorRouting,
): number[] {
  const sourceCenter = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const targetCenter = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
  const start = nearestAnchor(source, targetCenter, sourceAnchor);
  const end = nearestAnchor(target, sourceCenter, targetAnchor);
  if (routing === "straight") return [start.x, start.y, end.x, end.y];
  if (routing === "elbow") {
    const middleX = start.x + (end.x - start.x) / 2;
    return [start.x, start.y, middleX, start.y, middleX, end.y, end.x, end.y];
  }
  const middleX = start.x + (end.x - start.x) / 2;
  return [start.x, start.y, middleX, start.y, middleX, end.y, end.x, end.y];
}

export function pointInObject(point: CanvasPoint, object: MiniCanvasObject) {
  return point.x >= object.x && point.x <= object.x + object.width &&
    point.y >= object.y && point.y <= object.y + object.height;
}
