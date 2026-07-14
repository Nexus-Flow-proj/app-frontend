import type Konva from "konva";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject, TaskCardData } from "../types";
import { CanvasObjectType } from "@/types/enums";
import { clampTaskToFeature } from "../utils/featureContainment";

export function useTaskCardNode(obj: CanvasObject) {
  const data = obj.data as TaskCardData;

  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const hoveredObjectId = useWorkshopStore((s) => s.hoveredObjectId);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const isEditing = useWorkshopStore((s) => s.isEditing);

  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const setHoveredObject = useWorkshopStore((s) => s.setHoveredObject);
  const moveObject = useWorkshopStore((s) => s.moveObject);

  // Derived values
  const isSelected = selectedObjectId === obj.id;
  const isHovered = hoveredObjectId === obj.id;

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

  const constrainedPosition = (position: Coordinates) => {
    const featureId = data.featureId;
    const feature = useWorkshopStore
      .getState()
      .objects.find(
        (object) =>
          object.id === featureId &&
          object.type === CanvasObjectType.SECTION_FRAME,
      );
    return feature
      ? clampTaskToFeature(obj, feature, position)
      : { x: obj.x, y: obj.y };
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.target.position(
      constrainedPosition({ x: e.target.x(), y: e.target.y() }),
    );
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const position = constrainedPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
    e.target.position(position);
    moveObject(obj.id, position);
  };

  return {
    data,
    activeTool,
    isSelected,
    isHovered,
    isDraggable: isEditing && activeTool === "select",
    handleClick,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleDragMove,
    handleDragEnd,
  };
}
