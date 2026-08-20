import type Konva from "konva";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../constants";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject, TaskCardData } from "../types";

export function useTaskCardNode(obj: CanvasObject) {
  const data = obj.data as TaskCardData;

  const isSelected = useWorkshopStore((s) => s.selectedObjectId === obj.id);
  const isHovered = useWorkshopStore((s) => s.hoveredObjectId === obj.id);
  const activeTool = useWorkshopStore((s) => s.activeTool);

  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const setHoveredObject = useWorkshopStore((s) => s.setHoveredObject);
  const moveObject = useWorkshopStore((s) => s.moveObject);

  const statusCfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.BACKLOG;
  const priorityCfg = PRIORITY_CONFIG[data.priority] ?? PRIORITY_CONFIG.LOW;

  const handleClick = () => {
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
