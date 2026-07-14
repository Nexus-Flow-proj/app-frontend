import { CanvasObjectType } from "@/types/enums";
import { NODE_SIZE } from "../constants";
import type { CanvasObject } from "../types";
import type { WorkshopObjectKind } from "../types/workshopKinds";

let localId = Date.now();
const uid = (prefix: string) => `${prefix}-${++localId}`;

export function createObject(
  kind: WorkshopObjectKind,
  position: Coordinates,
  featureId?: string,
): CanvasObject {
  if (kind === "Feature") {
    const { w, h } = NODE_SIZE.SECTION_FRAME;
    return {
      id: uid("feature"),
      type: CanvasObjectType.SECTION_FRAME,
      x: position.x - w / 2,
      y: position.y - h / 2,
      width: w,
      height: h,
      rotation: 0,
      zIndex: 0,
      data: {
        kind,
        title: "New feature",
        backgroundColor: "#F5F3FF",
        borderColor: "#C4B5FD",
      },
    };
  }

  if (kind === "Note") {
    const { w, h } = NODE_SIZE.STICKY_NOTE;
    return {
      id: uid("note"),
      type: CanvasObjectType.STICKY_NOTE,
      x: position.x - w / 2,
      y: position.y - h / 2,
      width: w,
      height: h,
      rotation: -1,
      zIndex: 3,
      data: {
        kind,
        content: "Capture an idea, question, or reminder…",
        color: "#FEF3C7",
        fontSize: 13,
      },
    };
  }

  const { w, h } = NODE_SIZE.TASK_CARD;
  return {
    id: uid(kind.toLowerCase()),
    type: CanvasObjectType.TASK_CARD,
    x: position.x - w / 2,
    y: position.y - h / 2,
    width: w,
    height: h,
    rotation: 0,
    zIndex: 2,
    data: {
      featureId,
      kind,
      title: "New task",
      description: "Describe the work required for this task.",
    },
  };
}
