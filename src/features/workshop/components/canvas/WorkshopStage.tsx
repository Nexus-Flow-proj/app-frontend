import { useMemo, useRef } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import { ConnectorLayer } from "./ConnectorLayer";
import { MiniMap } from "./MiniMap";
import { SectionFrameNode } from "./SectionFrameNode";
import { TaskCardNode } from "./TaskCardNode";
import { StickyNoteNode } from "./StickyNoteNode";
import GridPattern from "./GridPattern";
import { useWorkshopStageInteractions } from "../../hooks/useWorkshopStageInteractions";
import { useWorkshopStore } from "../../store/workshopStore";
import { getObjectsByType } from "../../utils/workshopObjectSelectors";

interface WorkshopStageProps {
  width: number;
  height: number;
}

export function WorkshopStage({ width, height }: WorkshopStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const objects = useWorkshopStore((s) => s.objects);
  const isEditing = useWorkshopStore((s) => s.isEditing);

  const {
    viewport,
    activeTool,
    cursorClass,
    handleWheel,
    handleStageDragEnd,
    handleStageClick,
  } = useWorkshopStageInteractions({
    stageRef,
  });

  // Filter objects by type
  const { framesObj, tasksObj, stickiesObj } = useMemo(
    () => getObjectsByType(objects),
    [objects],
  );

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.08),_transparent_32%),linear-gradient(to_bottom_right,#f8fafc,#f1f5f9)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.12),_transparent_32%),linear-gradient(to_bottom_right,#111827,#0f172a)] ${cursorClass}`}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable={activeTool === "pan"} // The whole canvas can be dragged only in pan mode.
        onWheel={handleWheel} // zoom
        onDragEnd={handleStageDragEnd} // update viewport after dragging
        onClick={handleStageClick} // handle stage clicks (select/cancel/add object)
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
      >
        {/* Grid layer */}
        <Layer listening={false}>
          {/* listening: means this layer does not receive mouse events. */}
          <GridPattern width={width} height={height} viewport={viewport} />
        </Layer>

        {/* Renders section frames first. */}
        <Layer>
          {framesObj.map((obj) => (
            <SectionFrameNode key={obj.id} obj={obj} />
          ))}
        </Layer>

        {/* Renders connectors. */}
        <Layer listening={isEditing}>
          <ConnectorLayer />
        </Layer>

        <Layer>
          {tasksObj.map((obj) => (
            <TaskCardNode key={obj.id} obj={obj} />
          ))}
        </Layer>

        <Layer>
          {stickiesObj.map((obj) => (
            <StickyNoteNode key={obj.id} obj={obj} />
          ))}
        </Layer>
      </Stage>

      <MiniMap stageRef={stageRef} stageWidth={width} stageHeight={height} />
    </div>
  );
}
