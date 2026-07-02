import { useCallback, useEffect, useRef } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import { ConnectorLayer } from "./ConnectorLayer";
import { MiniMap } from "./MiniMap";
import { SectionFrameNode } from "./SectionFrameNode";
import { StickyNoteNode } from "./StickyNoteNode";
import { TaskCardNode } from "./TaskCardNode";
import GridPattern from "./GridPattern";
import { CanvasObjectType } from "@/types/enums";
import {
  CANVAS_MAX_SCALE,
  CANVAS_MIN_SCALE,
  CANVAS_ZOOM_FACTOR,
} from "../../constants";
import { useWorkshopStore } from "../../store/workshopStore";
import { createObject } from "../../utils/workshopObjectFactory";

interface WorkshopStageProps {
  width: number;
  height: number;
  onObjectOpen?: (objectId: string) => void;
}

export function WorkshopStage({
  width,
  height,
  onObjectOpen,
}: WorkshopStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const objects = useWorkshopStore((s) => s.objects);
  const viewport = useWorkshopStore((s) => s.viewport);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const setViewport = useWorkshopStore((s) => s.setViewport);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const addObject = useWorkshopStore((s) => s.addObject);
  const cancelConnect = useWorkshopStore((s) => s.cancelConnect);

  // Filter objects by type
  const framesObj = objects.filter(
    (obj) => obj.type === CanvasObjectType.SECTION_FRAME,
  );
  const tasksObj = objects.filter((o) => o.type === CanvasObjectType.TASK_CARD);
  const stickiesObj = objects.filter(
    (o) => o.type === CanvasObjectType.STICKY_NOTE,
  );

  // zoom in/out: This function runs when user scrolls the mouse wheel on the canvas
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault(); // Prevents the browser from scrolling the page

      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;

      const oldScale = stage.scaleX(); // Gets the current zoom level
      const direction = e.evt.deltaY > 0 ? -1 : 1; // Determines whether to zoom in or out based on the scroll direction

      // This calculates new zoom and clamps it between min and max
      const newScale = Math.min(
        CANVAS_MAX_SCALE,
        Math.max(
          CANVAS_MIN_SCALE,
          oldScale * Math.pow(CANVAS_ZOOM_FACTOR, direction),
        ),
      );

      // When you zoom, you want to zoom toward the mouse pointer, not toward the top-left corner (Without this, zoom feels bad.)
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      const newPos = {
        // This calculates the new canvas position after zoom.
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setViewport({ scale: newScale, x: newPos.x, y: newPos.y });
    },
    [setViewport],
  );

  // This runs when dragging the stage ends (The stage is draggable only when: the active tool is "pan")
  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === stageRef.current) {
        setViewport({ x: e.target.x(), y: e.target.y() });
      }
    },
    [setViewport],
  );

  // main click behavior - This runs when the user clicks on the stage (canvas).
  // It handles select empty canvas - cancel connect - add new task - add new sticky - add new section frame
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only handle clicks on empty canvas, not clicks on nodes (If user clicks a task card, the target is the task node, not the stage)
      if (e.target !== stageRef.current) return;

      // If user clicks empty canvas while select tool is active, clear selection
      if (activeTool === "select") {
        selectObject(null);
        return;
      }

      // If user clicks empty canvas while connecting, cancel connection
      if (activeTool === "connect") {
        cancelConnect();
        return;
      }

      // Gets mouse position
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;

      const canvasX = (pointer.x - stage.x()) / stage.scaleX();
      const canvasY = (pointer.y - stage.y()) / stage.scaleY();

      if (activeTool === "task") {
        const newObj = createObject("Task", { x: canvasX, y: canvasY });
        addObject(newObj);
        onObjectOpen?.(newObj.id);
        return;
      }

      if (activeTool === "sticky") {
        const newObj = createObject("Note", { x: canvasX, y: canvasY });
        addObject(newObj);
        onObjectOpen?.(newObj.id);
        return;
      }

      if (activeTool === "section") {
        const newObj = createObject("Phase", { x: canvasX, y: canvasY });
        addObject(newObj);
        onObjectOpen?.(newObj.id);
      }
    },
    [activeTool, addObject, cancelConnect, onObjectOpen, selectObject],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.position({ x: viewport.x, y: viewport.y });
    stage.scale({ x: viewport.scale, y: viewport.scale });
  }, [viewport]);

  const cursorClass =
    activeTool === "pan"
      ? "cursor-grab active:cursor-grabbing"
      : activeTool === "task" ||
          activeTool === "sticky" ||
          activeTool === "section"
        ? "cursor-crosshair"
        : activeTool === "connect"
          ? "cursor-cell"
          : "cursor-default";

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-slate-50 ${cursorClass}`}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable={activeTool === "pan"}
        onWheel={handleWheel}
        onDragEnd={handleStageDragEnd}
        onClick={handleStageClick}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
      >
        <Layer listening={false}>
          <GridPattern width={width} height={height} viewport={viewport} />
        </Layer>
        <Layer>
          {framesObj.map((obj) => (
            <SectionFrameNode key={obj.id} obj={obj} onOpen={onObjectOpen} />
          ))}
        </Layer>
        <Layer listening={false}>
          <ConnectorLayer />
        </Layer>
        <Layer>
          {tasksObj.map((obj) => (
            <TaskCardNode key={obj.id} obj={obj} onOpen={onObjectOpen} />
          ))}
          {stickiesObj.map((obj) => (
            <StickyNoteNode key={obj.id} obj={obj} onOpen={onObjectOpen} />
          ))}
        </Layer>
      </Stage>
      <MiniMap stageRef={stageRef} stageWidth={width} stageHeight={height} />
    </div>
  );
}
