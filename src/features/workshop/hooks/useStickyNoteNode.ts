import type Konva from "konva";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject, StickyNoteData } from "../types";

export function useStickyNoteNode(obj: CanvasObject) {
  const data = obj.data as StickyNoteData;
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const isConnecting = useWorkshopStore((s) => s.isConnecting);
  const connectFromId = useWorkshopStore((s) => s.connectFromId);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const moveObject = useWorkshopStore((s) => s.moveObject);
  const startConnect = useWorkshopStore((s) => s.startConnect);
  const finishConnect = useWorkshopStore((s) => s.finishConnect);

  const isSelected = selectedObjectId === obj.id;
  const isDraggable = activeTool === "select";

  const handleClick = () => {
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
