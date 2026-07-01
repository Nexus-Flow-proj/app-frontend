import { useCallback, useEffect, useRef } from "react";
import { Circle, Layer, Stage } from "react-konva";
import type Konva from "konva";
import { CanvasObjectType, TaskPriority, TaskStatus } from "@/types/enums";
import { ConnectorLayer } from "./ConnectorLayer";
import { MiniMap } from "./MiniMap";
import { SectionFrameNode } from "./SectionFrameNode";
import { StickyNoteNode } from "./StickyNoteNode";
import { TaskCardNode } from "./TaskCardNode";
import {
  CANVAS_GRID_SIZE,
  CANVAS_MAX_SCALE,
  CANVAS_MIN_SCALE,
  CANVAS_ZOOM_FACTOR,
  NODE_SIZE,
} from "../../constants";
import { useWorkshopStore } from "../../store/workshopStore";
import type { CanvasObject } from "../../types";

interface WorkshopStageProps {
  width: number;
  height: number;
  onObjectOpen?: (objectId: string) => void;
}

let nodeCounter = Date.now();
const uid = (prefix: string) => `${prefix}-${++nodeCounter}`;

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

  const frames = objects.filter(
    (o) => o.type === CanvasObjectType.SECTION_FRAME,
  );
  const tasks = objects.filter((o) => o.type === CanvasObjectType.TASK_CARD);
  const stickies = objects.filter(
    (o) => o.type === CanvasObjectType.STICKY_NOTE,
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;

      const oldScale = stage.scaleX();
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(
        CANVAS_MAX_SCALE,
        Math.max(
          CANVAS_MIN_SCALE,
          oldScale * Math.pow(CANVAS_ZOOM_FACTOR, direction),
        ),
      );

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setViewport({ scale: newScale, x: newPos.x, y: newPos.y });
    },
    [setViewport],
  );

  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === stageRef.current) {
        setViewport({ x: e.target.x(), y: e.target.y() });
      }
    },
    [setViewport],
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== stageRef.current) return;

      if (activeTool === "select") {
        selectObject(null);
        return;
      }

      if (activeTool === "connect") {
        cancelConnect();
        return;
      }

      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;

      const canvasX = (pointer.x - stage.x()) / stage.scaleX();
      const canvasY = (pointer.y - stage.y()) / stage.scaleY();

      if (activeTool === "task") {
        const { w, h } = NODE_SIZE.TASK_CARD;
        const newObj: CanvasObject = {
          id: uid("task"),
          type: CanvasObjectType.TASK_CARD,
          x: canvasX - w / 2,
          y: canvasY - h / 2,
          width: w,
          height: h,
          rotation: 0,
          zIndex: 2,
          data: {
            taskId: uid("t"),
            kind: "Task",
            title: "New workshop item",
            description: "Add details for this planning item.",
            status: TaskStatus.BACKLOG,
            priority: TaskPriority.MEDIUM,
          },
        };
        addObject(newObj);
        onObjectOpen?.(newObj.id);
        return;
      }

      if (activeTool === "sticky") {
        const { w, h } = NODE_SIZE.STICKY_NOTE;
        const newObj: CanvasObject = {
          id: uid("note"),
          type: CanvasObjectType.STICKY_NOTE,
          x: canvasX - w / 2,
          y: canvasY - h / 2,
          width: w,
          height: h,
          rotation: -1,
          zIndex: 3,
          data: {
            kind: "Note",
            content: "Capture a note, blocker, or decision here.",
            color: "#FEF08A",
            fontSize: 13,
          },
        };
        addObject(newObj);
        onObjectOpen?.(newObj.id);
        return;
      }

      if (activeTool === "section") {
        const { w, h } = NODE_SIZE.SECTION_FRAME;
        const newObj: CanvasObject = {
          id: uid("phase"),
          type: CanvasObjectType.SECTION_FRAME,
          x: canvasX - w / 2,
          y: canvasY - h / 2,
          width: w,
          height: h,
          rotation: 0,
          zIndex: 0,
          data: {
            kind: "Phase",
            title: "New planning phase",
            description: "Group related tasks and milestones here.",
            backgroundColor: "#EFF6FF",
            borderColor: "#BFDBFE",
          },
        };
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
          {frames.map((obj) => (
            <SectionFrameNode key={obj.id} obj={obj} onOpen={onObjectOpen} />
          ))}
        </Layer>
        <Layer listening={false}>
          <ConnectorLayer />
        </Layer>
        <Layer>
          {tasks.map((obj) => (
            <TaskCardNode key={obj.id} obj={obj} onOpen={onObjectOpen} />
          ))}
          {stickies.map((obj) => (
            <StickyNoteNode key={obj.id} obj={obj} onOpen={onObjectOpen} />
          ))}
        </Layer>
      </Stage>
      <MiniMap stageRef={stageRef} stageWidth={width} stageHeight={height} />
    </div>
  );
}

interface GridPatternProps {
  width: number;
  height: number;
  viewport: { x: number; y: number; scale: number };
}

function GridPattern({ width, height, viewport }: GridPatternProps) {
  const step = CANVAS_GRID_SIZE;
  const dots: React.ReactElement[] = [];
  const scaledStep = step * viewport.scale;
  const offsetX = viewport.x % scaledStep;
  const offsetY = viewport.y % scaledStep;

  for (let x = offsetX - scaledStep; x < width + scaledStep; x += scaledStep) {
    for (
      let y = offsetY - scaledStep;
      y < height + scaledStep;
      y += scaledStep
    ) {
      dots.push(
        <Circle
          key={`${Math.round(x)}-${Math.round(y)}`}
          x={x}
          y={y}
          radius={1}
          fill="#CBD5E1"
          opacity={0.55}
        />,
      );
    }
  }

  return <>{dots}</>;
}
