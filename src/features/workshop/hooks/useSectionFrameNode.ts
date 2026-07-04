import type Konva from "konva";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject, SectionFrameData } from "../types";

export function useSectionFrameNode(obj: CanvasObject) {
  const data = obj.data as SectionFrameData;
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const moveObject = useWorkshopStore((s) => s.moveObject);

  const isSelected = selectedObjectId === obj.id;
  const isDraggable = activeTool === "select";

  const handleClick = () => {
    if (activeTool !== "select") return;
    selectObject(obj.id);
  };

  const handleDoubleClick = () => {
    if (activeTool === "select") openObjectDetails(obj.id);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    moveObject(obj.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  return {
    data,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragEnd,
  };
}
