import { useWorkshopStore } from "../store/workshopStore";

export function useWorkshopToolbar() {
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const setActiveTool = useWorkshopStore((s) => s.setActiveTool);
  const undo = useWorkshopStore((s) => s.undo);
  const redo = useWorkshopStore((s) => s.redo);
  const undoStack = useWorkshopStore((s) => s.undoStack);
  const redoStack = useWorkshopStore((s) => s.redoStack);
  const isEditing = useWorkshopStore((s) => s.isEditing);

  return {
    activeTool,
    setActiveTool,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    isEditing,
  };
}
