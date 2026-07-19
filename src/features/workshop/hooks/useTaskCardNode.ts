import type Konva from "konva";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../constants";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject, TaskCardData } from "../types";

export function useTaskCardNode(obj: CanvasObject) {
  const data = obj.data as TaskCardData;

  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const hoveredObjectId = useWorkshopStore((s) => s.hoveredObjectId);
  const isConnecting = useWorkshopStore((s) => s.isConnecting);
  const connectFromId = useWorkshopStore((s) => s.connectFromId);
  const activeTool = useWorkshopStore((s) => s.activeTool);

  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const setHoveredObject = useWorkshopStore((s) => s.setHoveredObject);
  const moveObject = useWorkshopStore((s) => s.moveObject);
  const startConnect = useWorkshopStore((s) => s.startConnect);
  const finishConnect = useWorkshopStore((s) => s.finishConnect);

  // Derived values
  const isSelected = selectedObjectId === obj.id;
  const isHovered = hoveredObjectId === obj.id;

  const statusCfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.BACKLOG;
  const priorityCfg = PRIORITY_CONFIG[data.priority] ?? PRIORITY_CONFIG.LOW;

  const handleClick = () => {
    // If the active tool is "connect", clicking this card means the user wants to create a connection.
    if (activeTool === "connect") {
      if (isConnecting && connectFromId) finishConnect(obj.id);
      else startConnect(obj.id);
      return;
    }

    if (activeTool === "select") {
      selectObject(obj.id);
    }
  };

  const handleDoubleClick = () => {
    if (activeTool === "select") {
      openObjectDetails(obj.id);
    }
  };

  const handleMouseEnter = () => {
    setHoveredObject(obj.id);
  };

  const handleMouseLeave = () => {
    setHoveredObject(null);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    moveObject(obj.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  return {
    data,
    activeTool,
    isSelected,
    isHovered,
    statusCfg,
    priorityCfg,
    isDraggable: activeTool === "select",
    handleClick,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleDragEnd,
  };
}
