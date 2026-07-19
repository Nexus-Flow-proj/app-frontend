import { useCallback, useMemo, type RefObject } from "react";
import type Konva from "konva";
import {
  CANVAS_MAX_SCALE,
  CANVAS_MIN_SCALE,
  CANVAS_ZOOM_FACTOR,
} from "../constants";
import { TOOL_TO_KIND } from "../constants/toolToKind";
import { useWorkshopStore } from "../store/workshopStore";
import { createObject } from "../utils/workshopObjectFactory";

interface UseWorkshopStageInteractionsParams {
  stageRef: RefObject<Konva.Stage | null>;
}

export function useWorkshopStageInteractions({
  stageRef,
}: UseWorkshopStageInteractionsParams) {
  const viewport = useWorkshopStore((s) => s.viewport);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const setViewport = useWorkshopStore((s) => s.setViewport);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const addObject = useWorkshopStore((s) => s.addObject);
  const cancelConnect = useWorkshopStore((s) => s.cancelConnect);

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
    [setViewport, stageRef],
  );

  // This runs when dragging the stage ends (The stage is draggable only when: the active tool is "pan")
  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target !== stageRef.current) return;
      setViewport({ x: e.target.x(), y: e.target.y() });
    },
    [setViewport, stageRef],
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

      const kind = TOOL_TO_KIND[activeTool];
      if (!kind) return;

      // Gets mouse position
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;

      const canvasX = (pointer.x - stage.x()) / stage.scaleX();
      const canvasY = (pointer.y - stage.y()) / stage.scaleY();

      const newObj = createObject(kind, { x: canvasX, y: canvasY });
      addObject(newObj);
      openObjectDetails(newObj.id);
    },
    [
      activeTool,
      addObject,
      cancelConnect,
      openObjectDetails,
      selectObject,
      stageRef,
    ],
  );

  // changes the mouse cursor depending on selected tool.
  const cursorClass = useMemo(() => {
    if (activeTool === "pan") return "cursor-grab active:cursor-grabbing";

    if (
      activeTool === "task" ||
      activeTool === "sticky" ||
      activeTool === "section"
    ) {
      return "cursor-crosshair";
    }

    if (activeTool === "connect") return "cursor-cell";

    return "cursor-default";
  }, [activeTool]);

  return {
    viewport,
    activeTool,
    cursorClass,
    handleWheel,
    handleStageDragEnd,
    handleStageClick,
  };
}
