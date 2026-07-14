import { CanvasObjectType } from "@/types/enums";
import { FEATURE_LAYOUT } from "../constants";
import type { CanvasObject, TaskCardData } from "../types";

function isFeature(object: CanvasObject): boolean {
  return object.type === CanvasObjectType.SECTION_FRAME;
}

export function getContainingFeature(
  objects: CanvasObject[],
  point: Coordinates,
): CanvasObject | undefined {
  return objects
    .filter(isFeature)
    .sort((a, b) => b.zIndex - a.zIndex)
    .find(
      (feature) =>
        point.x >= feature.x &&
        point.x <= feature.x + feature.width &&
        point.y >= feature.y &&
        point.y <= feature.y + feature.height,
    );
}

export function clampTaskToFeature(
  task: CanvasObject,
  feature: CanvasObject,
  position: Coordinates,
): Coordinates {
  const minX = feature.x + FEATURE_LAYOUT.paddingX;
  const minY = feature.y + FEATURE_LAYOUT.contentTop;
  const maxX = Math.max(
    minX,
    feature.x + feature.width - FEATURE_LAYOUT.paddingX - task.width,
  );
  const maxY = Math.max(
    minY,
    feature.y + feature.height - FEATURE_LAYOUT.paddingX - task.height,
  );

  return {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
  };
}

function overlaps(a: CanvasObject, b: CanvasObject): boolean {
  const gap = FEATURE_LAYOUT.gap / 2;
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

export function getNextTaskPosition(
  task: CanvasObject,
  feature: CanvasObject,
  objects: CanvasObject[],
  preferredCenter?: Coordinates,
): Coordinates {
  const siblingTasks = objects.filter(
    (object) =>
      object.type === CanvasObjectType.TASK_CARD &&
      (object.data as TaskCardData).featureId === feature.id,
  );

  if (preferredCenter) {
    const preferred = clampTaskToFeature(task, feature, {
      x: preferredCenter.x - task.width / 2,
      y: preferredCenter.y - task.height / 2,
    });
    const candidate = { ...task, ...preferred };
    if (!siblingTasks.some((sibling) => overlaps(candidate, sibling))) {
      return preferred;
    }
  }

  const startX = feature.x + FEATURE_LAYOUT.paddingX;
  const startY = feature.y + FEATURE_LAYOUT.contentTop;
  const maxX = feature.x + feature.width - FEATURE_LAYOUT.paddingX - task.width;
  const maxY = feature.y + feature.height - FEATURE_LAYOUT.paddingX - task.height;

  for (let y = startY; y <= maxY; y += task.height + FEATURE_LAYOUT.gap) {
    for (let x = startX; x <= maxX; x += task.width + FEATURE_LAYOUT.gap) {
      const candidate = { ...task, x, y };
      if (!siblingTasks.some((sibling) => overlaps(candidate, sibling))) {
        return { x, y };
      }
    }
  }

  return clampTaskToFeature(task, feature, {
    x: maxX,
    y: maxY,
  });
}

export function isTaskInsideFeature(
  task: CanvasObject,
  feature: CanvasObject,
): boolean {
  const clamped = clampTaskToFeature(task, feature, task);
  return clamped.x === task.x && clamped.y === task.y;
}

export function normalizeTaskContainment(
  objects: CanvasObject[],
): CanvasObject[] {
  const features = objects.filter(isFeature);
  if (features.length === 0) return objects;

  return objects.map((object) => {
    if (object.type !== CanvasObjectType.TASK_CARD) return object;

    const data = object.data as TaskCardData;
    const center = {
      x: object.x + object.width / 2,
      y: object.y + object.height / 2,
    };
    const declaredFeature = features.find(
      (feature) => feature.id === data.featureId,
    );
    const feature =
      declaredFeature ??
      getContainingFeature(features, center) ??
      [...features].sort((a, b) => {
        const distanceA =
          Math.abs(a.x + a.width / 2 - center.x) +
          Math.abs(a.y + a.height / 2 - center.y);
        const distanceB =
          Math.abs(b.x + b.width / 2 - center.x) +
          Math.abs(b.y + b.height / 2 - center.y);
        return distanceA - distanceB;
      })[0];
    const position = clampTaskToFeature(object, feature, object);

    return {
      ...object,
      ...position,
      data: { ...data, featureId: feature.id },
    };
  });
}
