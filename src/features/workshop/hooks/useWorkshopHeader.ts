import { useNavigate, useParams } from "react-router";
import { ROUTES } from "@/constants/routing";
import { useProjectStore } from "@/store/projectStore";
import { useWorkshopCanvas } from "./useWorkshopCanvas";
import { usePublishWorkshopPlan } from "./usePublishWorkshopPlan";
import { useWorkshopStore } from "../store/workshopStore";
import type { WorkshopObjectKind } from "../types";
import { toast } from "sonner";

interface StageSize {
  width: number;
  height: number;
}

export function useWorkshopHeader(stageSize: StageSize) {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const projectId = routeProjectId ?? "";
  const navigate = useNavigate();
  const canEdit = useProjectStore(
    (state) =>
      state.isAdmin() ||
      state.hasAllPermissions([
        "workshop.createNodes",
        "workshop.updateNodes",
        "workshop.deleteNodes",
        "tasks.create",
        "tasks.update",
        "tasks.delete",
        "board.manageColumns",
      ]),
  );
  const { objects, viewport, addItem, setViewport } = useWorkshopCanvas();
  const openObjectDetails = useWorkshopStore(
    (state) => state.openObjectDetails,
  );
  const isDirty = useWorkshopStore((state) => state.isDirty);
  const isEditing = useWorkshopStore((state) => state.isEditing);
  const isPublishing = useWorkshopStore((state) => state.isPublishing);
  const beginEdit = useWorkshopStore((state) => state.beginEdit);
  const discardDraft = useWorkshopStore((state) => state.discardDraft);
  const publishPlan = usePublishWorkshopPlan(projectId);

  const canvasPointAtCenter = () => ({
    x: (stageSize.width / 2 - viewport.x) / viewport.scale,
    y: (stageSize.height / 2 - viewport.y) / viewport.scale,
  });

  const handleResetView = () => {
    setViewport({ x: 32, y: 32, scale: 0.82 });
  };

  const handleAddItem = (kind: WorkshopObjectKind) => {
    if (!isEditing) return;
    const item = addItem(kind, canvasPointAtCenter());
    if (!item) {
      toast.info("Select a feature before adding a task.");
      return;
    }
    openObjectDetails(item.id);
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
      (accumulator, object) => ({
        minX: Math.min(accumulator.minX, object.x),
        minY: Math.min(accumulator.minY, object.y),
        maxX: Math.max(accumulator.maxX, object.x + object.width),
        maxY: Math.max(accumulator.maxY, object.y + object.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    const padding = 96;
    const contentWidth = bounds.maxX - bounds.minX + padding * 2;
    const contentHeight = bounds.maxY - bounds.minY + padding * 2;
    const scale = Math.min(
      1.15,
      Math.max(
        0.28,
        Math.min(
          stageSize.width / contentWidth,
          stageSize.height / contentHeight,
        ),
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
    isEditing,
    isPublishing,
    canEdit,
    beginEdit,
    discardDraft,
    publishPlan: () => publishPlan.mutate(),
    openBoard: () => projectId && navigate(ROUTES.BOARDS(projectId)),
    handleAddItem,
    handleFitView,
    handleResetView,
  };
}
