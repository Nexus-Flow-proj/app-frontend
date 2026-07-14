import { useWorkshopStore } from "../store/workshopStore";

/**
 * Workshop persistence is intentionally explicit.
 * Draft changes are published only through usePublishWorkshopPlan; there is no
 * debounce or fallback autosave because either would bypass Save/Revert.
 */
export function useCanvasSync() {
  const isEditing = useWorkshopStore((state) => state.isEditing);
  const isDirty = useWorkshopStore((state) => state.isDirty);
  const isPublishing = useWorkshopStore((state) => state.isPublishing);

  return { isEditing, isDirty, isPublishing };
}
