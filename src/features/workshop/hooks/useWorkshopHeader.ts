import { useParams } from "react-router";
import { useMockWorkshop } from "./useMockWorkshop";
import { useWorkshopStore } from "../store/workshopStore";
import type { WorkshopObjectKind } from "../types";

interface StageSize {
  width: number;
  height: number;
}

export function useWorkshopHeader(stageSize: StageSize) {
  const { id: projectId } = useParams();
  const { objects, viewport, addItem, setViewport } = useMockWorkshop();
  const openObjectDetails = useWorkshopStore((s) => s.openObjectDetails);
  const isDirty = useWorkshopStore((s) => s.isDirty);

  const canvasPointAtCenter = () => ({
    x: (stageSize.width / 2 - viewport.x) / viewport.scale,
    y: (stageSize.height / 2 - viewport.y) / viewport.scale,
  });

  const handleResetView = () => {
    setViewport({ x: 32, y: 32, scale: 0.82 });
  };

  const handleAddItem = (kind: WorkshopObjectKind) => {
    const id = addItem(kind, canvasPointAtCenter());
    openObjectDetails(id);
  };

  const handleFitView = () => {
    if (
      objects.length === 0 ||
      stageSize.width === 0 ||
      stageSize.height === 0
    ) {
      handleResetView();
      return;
    }

    const bounds = objects.reduce(
      (acc, obj) => ({
        minX: Math.min(acc.minX, obj.x),
        minY: Math.min(acc.minY, obj.y),
        maxX: Math.max(acc.maxX, obj.x + obj.width),
        maxY: Math.max(acc.maxY, obj.y + obj.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    const padding = 96;
    const contentW = bounds.maxX - bounds.minX + padding * 2;
    const contentH = bounds.maxY - bounds.minY + padding * 2;
    const scale = Math.min(
      1.15,
      Math.max(
        0.28,
        Math.min(stageSize.width / contentW, stageSize.height / contentH),
      ),
    );

    setViewport({
      scale,
      x: stageSize.width / 2 - ((bounds.minX + bounds.maxX) / 2) * scale,
      y: stageSize.height / 2 - ((bounds.minY + bounds.maxY) / 2) * scale,
    });
  };

  return {
    projectId,
    isDirty,
    handleAddItem,
    handleFitView,
    handleResetView,
  };
}
