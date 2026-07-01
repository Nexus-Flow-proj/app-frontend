import { Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import { CanvasObjectType } from "@/types/enums";
import { STATUS_CONFIG } from "../../constants";
import { useWorkshopStore } from "../../store/workshopStore";
import type {
  CanvasObject,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
} from "../../types";

const MAP_W = 180;
const MAP_H = 120;
const CANVAS_W = 2400;
const CANVAS_H = 1600;
const SCALE_X = MAP_W / CANVAS_W;
const SCALE_Y = MAP_H / CANVAS_H;

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

interface MiniMapProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageWidth: number;
  stageHeight: number;
}

export function MiniMap({ stageRef, stageWidth, stageHeight }: MiniMapProps) {
  const objects = useWorkshopStore((s) => s.objects);
  const viewport = useWorkshopStore((s) => s.viewport);
  const setViewport = useWorkshopStore((s) => s.setViewport);

  const vpW = (stageWidth / viewport.scale) * SCALE_X;
  const vpH = (stageHeight / viewport.scale) * SCALE_Y;
  const vpX = (-viewport.x / viewport.scale) * SCALE_X;
  const vpY = (-viewport.y / viewport.scale) * SCALE_Y;

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

  return (
    <div className="absolute bottom-6 right-6 z-10 overflow-hidden rounded-lg border border-border bg-card/90 shadow-lg backdrop-blur-sm">
      <p className="border-b border-border px-3 py-1 text-[10px] font-medium text-muted-foreground">
        Overview
      </p>
      <Stage width={MAP_W} height={MAP_H} onClick={handleClick}>
        <Layer>
          <Rect width={MAP_W} height={MAP_H} fill="#F8FAFC" />
          {objects.map((obj) => (
            <Rect
              key={obj.id}
              x={obj.x * SCALE_X}
              y={obj.y * SCALE_Y}
              width={Math.max(obj.width * SCALE_X, 4)}
              height={Math.max(obj.height * SCALE_Y, 3)}
              fill={miniColor(obj)}
              opacity={0.8}
              cornerRadius={1}
              listening={false}
            />
          ))}
          <Rect
            x={Math.max(0, vpX)}
            y={Math.max(0, vpY)}
            width={Math.min(vpW, MAP_W)}
            height={Math.min(vpH, MAP_H)}
            fill="rgba(144, 99, 235, 0.1)"
            stroke="#9063EB"
            strokeWidth={1}
            dash={[3, 2]}
            listening={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}
