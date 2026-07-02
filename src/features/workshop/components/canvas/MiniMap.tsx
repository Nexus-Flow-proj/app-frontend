import { Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import { MINI_MAP_H, MINI_MAP_W, useMiniMap } from "../../hooks/useMiniMap";

interface MiniMapProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageWidth: number;
  stageHeight: number;
}

export function MiniMap({ stageRef, stageWidth, stageHeight }: MiniMapProps) {
  const { miniObjects, viewportRect, handleClick } = useMiniMap({
    stageRef,
    stageWidth,
    stageHeight,
  });

  return (
    <div className="absolute bottom-6 right-6 z-10 overflow-hidden rounded-lg border border-border bg-card/90 shadow-lg backdrop-blur-sm">
      <p className="border-b border-border px-3 py-1 text-[10px] font-medium text-muted-foreground">
        Overview
      </p>
      <Stage width={MINI_MAP_W} height={MINI_MAP_H} onClick={handleClick}>
        <Layer>
          <Rect width={MINI_MAP_W} height={MINI_MAP_H} fill="#F8FAFC" />
          {miniObjects.map((obj) => (
            <Rect
              key={obj.id}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill={obj.fill}
              opacity={0.8}
              cornerRadius={1}
              listening={false}
            />
          ))}
          <Rect
            x={viewportRect.x}
            y={viewportRect.y}
            width={viewportRect.width}
            height={viewportRect.height}
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
