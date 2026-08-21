import type Konva from "konva";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject, SectionFrameData } from "../types";

export function useSectionFrameNode(obj: CanvasObject) {
  const data = obj.data as SectionFrameData;
  const isSelected = useWorkshopStore((s) => s.selectedObjectId === obj.id);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const moveObject = useWorkshopStore((s) => s.moveObject);
  const resizeObject = useWorkshopStore((s) => s.resizeObject);

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

  const handleTransformEnd = (node: Konva.Node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 so the rect dimensions reflect the true size
    node.scaleX(1);
    node.scaleY(1);

    resizeObject(obj.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(120, node.width() * scaleX),
      height: Math.max(80, node.height() * scaleY),
    });
  };

  return {
    data,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragEnd,
    handleTransformEnd,
  };
}
