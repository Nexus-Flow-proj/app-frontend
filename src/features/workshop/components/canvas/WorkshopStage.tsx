import { useMemo, useRef } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import { MiniMap } from "./MiniMap";
import { SectionFrameNode } from "./SectionFrameNode";
import { StickyNoteNode } from "./StickyNoteNode";
import { TaskCardNode } from "./TaskCardNode";
import GridPattern from "./GridPattern";
import { TextBoxNode } from "./TextBoxNode";
import { useWorkshopStageInteractions } from "../../hooks/useWorkshopStageInteractions";
import { useWorkshopStore } from "../../store/workshopStore";
import { getObjectsByType } from "../../utils/workshopObjectSelectors";
import { useTheme } from "@/providers/ThemeProvider";

interface WorkshopStageProps {
  width: number;
  height: number;
}

export function WorkshopStage({ width, height }: WorkshopStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const objects = useWorkshopStore((s) => s.objects);
  const { resolvedTheme } = useTheme();
  const darkCanvas = resolvedTheme === "dark";

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
  const { framesObj, tasksObj, stickiesObj, textObj } = useMemo(
    () => getObjectsByType(objects),
    [objects],
  );

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#f8f7fc] dark:bg-[#0b0912] ${cursorClass}`}
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
          <GridPattern width={width} height={height} viewport={viewport} dark={darkCanvas} />
        </Layer>

        {/* Renders section frames first. */}
        <Layer>
          {framesObj.map((obj) => (
            <SectionFrameNode key={obj.id} obj={obj} />
          ))}
        </Layer>

        <Layer>
          {tasksObj.map((obj) => (
            <TaskCardNode key={obj.id} obj={obj} />
          ))}
          {stickiesObj.map((obj) => (
            <StickyNoteNode key={obj.id} obj={obj} />
          ))}
          {textObj.map((obj) => (
            <TextBoxNode key={obj.id} obj={obj} />
          ))}
        </Layer>
      </Stage>

      <MiniMap stageRef={stageRef} stageWidth={width} stageHeight={height} />
    </div>
  );
}
