import { useMemo } from "react";
import type Konva from "konva";
import { CanvasObjectType } from "@/types/enums";
import { STATUS_CONFIG } from "../constants";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  CanvasObject,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
} from "../types";

export const MINI_MAP_W = 180;
export const MINI_MAP_H = 120;

const CANVAS_W = 2400;
const CANVAS_H = 1600;
const SCALE_X = MINI_MAP_W / CANVAS_W;
const SCALE_Y = MINI_MAP_H / CANVAS_H;

function miniColor(obj: CanvasObject): string {
  if (obj.type === CanvasObjectType.TASK_CARD) {
    const data = obj.data as TaskCardData;
    return STATUS_CONFIG[data.status]?.dot ?? "#CBD5E1";
  }
  if (obj.type === CanvasObjectType.STICKY_NOTE) {
    return (obj.data as StickyNoteData).color;
  }
  if (obj.type === CanvasObjectType.SECTION_FRAME) {
    return (obj.data as SectionFrameData).borderColor;
  }
  return "#CBD5E1";
}

interface UseMiniMapParams {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageWidth: number;
  stageHeight: number;
}

export function useMiniMap({
  stageRef,
  stageWidth,
  stageHeight,
}: UseMiniMapParams) {
  const objects = useWorkshopStore((s) => s.objects);
  const viewport = useWorkshopStore((s) => s.viewport);
  const setViewport = useWorkshopStore((s) => s.setViewport);

  const miniObjects = useMemo(
    () =>
      objects.map((obj) => ({
        id: obj.id,
        x: obj.x * SCALE_X,
        y: obj.y * SCALE_Y,
        width: Math.max(obj.width * SCALE_X, 4),
        height: Math.max(obj.height * SCALE_Y, 3),
        fill: miniColor(obj),
      })),
    [objects],
  );

  const viewportRect = {
    x: Math.max(0, (-viewport.x / viewport.scale) * SCALE_X),
    y: Math.max(0, (-viewport.y / viewport.scale) * SCALE_Y),
    width: Math.min((stageWidth / viewport.scale) * SCALE_X, MINI_MAP_W),
    height: Math.min((stageHeight / viewport.scale) * SCALE_Y, MINI_MAP_H),
  };

  const handleClick = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    const pos = event.target.getStage()?.getPointerPosition();
    if (!pos || !stage) return;

    const canvasX = (pos.x / SCALE_X) * viewport.scale;
    const canvasY = (pos.y / SCALE_Y) * viewport.scale;
    const next = {
      x: stage.width() / 2 - canvasX,
      y: stage.height() / 2 - canvasY,
    };

    setViewport(next);
    stage.position(next);
  };

  return {
    miniObjects,
    viewportRect,
    handleClick,
  };
}
