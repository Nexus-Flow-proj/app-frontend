// ============================================================
// features/workshop/hooks/useCanvasState.ts
//
// Keyboard shortcuts and canvas-level event handling.
// Registered on the WorkshopPage; cleaned up on unmount.
// ============================================================

import { useEffect } from "react";
import { useWorkshopStore } from "../store/workshopStore";

export function useCanvasShortcuts() {
  const undo = useWorkshopStore((s) => s.undo);
  const redo = useWorkshopStore((s) => s.redo);
  const deleteObject = useWorkshopStore((s) => s.deleteObject);
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const setActiveTool = useWorkshopStore((s) => s.setActiveTool);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      // Don't fire shortcuts when typing in an input/textarea
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedObjectId) {
        e.preventDefault();
        deleteObject(selectedObjectId);
      }

      // Tool shortcuts
      if (!ctrl) {
        if (e.key === "v" || e.key === "Escape") {
          setActiveTool("select");
        }
        if (e.key === "h") setActiveTool("pan");
        if (e.key === "t") setActiveTool("task");
        if (e.key === "n") setActiveTool("sticky");
        if (e.key === "x") setActiveTool("text");
        if (e.key === "s") setActiveTool("section");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    undo,
    redo,
    deleteObject,
    selectedObjectId,
    setActiveTool,
  ]);
}
