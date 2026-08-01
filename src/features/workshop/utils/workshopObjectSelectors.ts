import { CanvasObjectType } from "@/types/enums";
import type { CanvasObject } from "../types";

export function getObjectsByType(objects: CanvasObject[]) {
  return {
    framesObj: objects.filter(
      (obj) => obj.type === CanvasObjectType.SECTION_FRAME,
    ),
    tasksObj: objects.filter((obj) => obj.type === CanvasObjectType.TASK_CARD),
    stickiesObj: objects.filter(
      (obj) => obj.type === CanvasObjectType.STICKY_NOTE,
    ),
    textObj: objects.filter((obj) => obj.type === CanvasObjectType.TEXT_BOX),
  };
}
