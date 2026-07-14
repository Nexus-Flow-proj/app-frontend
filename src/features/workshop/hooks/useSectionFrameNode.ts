import { useRef } from "react";
import type Konva from "konva";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  CanvasObject,
  SectionFrameData,
  WorkshopSnapshot,
} from "../types";
import { cloneSnapshot } from "../utils/cloneSnapshotCanvas";
import { CanvasObjectType } from "@/types/enums";
import type { TaskCardData } from "../types";

export function useSectionFrameNode(obj: CanvasObject) {
  const data = obj.data as SectionFrameData;
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const isEditing = useWorkshopStore((s) => s.isEditing);
  const isConnecting = useWorkshopStore((s) => s.isConnecting);
  const connectFromId = useWorkshopStore((s) => s.connectFromId);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const previewFeatureMove = useWorkshopStore((s) => s.previewFeatureMove);
  const commitPreviewMove = useWorkshopStore((s) => s.commitPreviewMove);
  const startConnect = useWorkshopStore((s) => s.startConnect);
  const finishConnect = useWorkshopStore((s) => s.finishConnect);

  const isSelected = selectedObjectId === obj.id;
  const isDraggable = isEditing && activeTool === "select";
  const dragStartSnapshot = useRef<WorkshopSnapshot | null>(null);
  const taskCount = useWorkshopStore(
    (state) =>
      state.objects.filter(
        (object) =>
          object.type === CanvasObjectType.TASK_CARD &&
          (object.data as TaskCardData).featureId === obj.id,
      ).length,
  );

  const handleClick = () => {
    if (isEditing && activeTool === "connect") {
      if (isConnecting && connectFromId) finishConnect(obj.id);
      else startConnect(obj.id);
      return;
    }
    if (activeTool !== "select") return;
    selectObject(obj.id);
  };

  const handleDoubleClick = () => {
    if (activeTool === "select") openObjectDetails(obj.id);
  };

  const handleDragStart = () => {
    const state = useWorkshopStore.getState();
    dragStartSnapshot.current = cloneSnapshot(
      state.objects,
      state.connections,
    );
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    previewFeatureMove(obj.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    previewFeatureMove(obj.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
    if (dragStartSnapshot.current) {
      commitPreviewMove(dragStartSnapshot.current);
      dragStartSnapshot.current = null;
    }
  };

  return {
    data,
    taskCount,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
