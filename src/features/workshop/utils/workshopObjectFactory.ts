import { CanvasObjectType, TaskPriority, TaskStatus } from "@/types/enums";
import { NODE_SIZE } from "../constants";
import type { CanvasObject } from "../types";
import type { WorkshopObjectKind } from "../types/workshopKinds";

let localId = Date.now();
const uid = (prefix: string) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${++localId}`;

export function createObject(
  kind: WorkshopObjectKind,
  position: Coordinates,
): CanvasObject {
  // SectionFrame
  if (kind === "Project" || kind === "Phase" || kind === "Feature") {
    const { w, h } = NODE_SIZE.SECTION_FRAME;
    return {
      id: uid(kind.toLowerCase()),
      parentFrameId: null,
      type: CanvasObjectType.SECTION_FRAME,
      x: position.x - w / 2,
      y: position.y - h / 2,
      width: w,
      height: h,
      rotation: 0,
      zIndex: 0,
      data: {
        kind,
        title: kind === "Project" ? "New project" : kind === "Feature" ? "New feature" : "New phase",
        description: "Describe this planning area.",
        backgroundColor: kind === "Project" ? "#F0EAFF" : "#EFF6FF",
        borderColor: kind === "Project" ? "#C4AFF7" : "#BFDBFE",
      },
    };
  }

  if (kind === "Note") {
    const { w, h } = NODE_SIZE.STICKY_NOTE;
    return {
      id: uid("note"),
      parentFrameId: null,
      type: CanvasObjectType.STICKY_NOTE,
      x: position.x - w / 2,
      y: position.y - h / 2,
      width: w,
      height: h,
      rotation: -1,
      zIndex: 3,
      data: {
        kind,
        content: "Add a workshop note.",
        color: "#FEF08A",
        fontSize: 13,
      },
    };
  }

  if (kind === "Text") {
    const { w, h } = NODE_SIZE.TEXT_BOX;
    return {
      id: uid("text"),
      parentFrameId: null,
      type: CanvasObjectType.TEXT_BOX,
      x: position.x - w / 2,
      y: position.y - h / 2,
      width: w,
      height: h,
      rotation: 0,
      zIndex: 4,
      data: {
        kind: "Text",
        content: "Add supporting context",
        color: "#334155",
        fontSize: 18,
      },
    };
  }

  const { w, h } = NODE_SIZE.TASK_CARD;
  return {
    id: uid(kind.toLowerCase()),
    parentFrameId: null,
    type: CanvasObjectType.TASK_CARD,
    x: position.x - w / 2,
    y: position.y - h / 2,
    width: w,
    height: h,
    rotation: 0,
    zIndex: 2,
    data: {
      taskId: uid("t"),
      kind,
      title: `New ${kind.toLowerCase()}`,
      description: "Add context, owner, and timing.",
      status: TaskStatus.BACKLOG,
      priority: kind === "Risk" ? TaskPriority.URGENT : TaskPriority.MEDIUM,
    },
  };
}
