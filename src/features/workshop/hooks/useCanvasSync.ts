// ============================================================
// features/workshop/hooks/useCanvasSync.ts
//
// Debounced PATCH save + 30s fallback autosave.
// Per AGENT.md: debounce = 1500ms, fallback = 30s.
//
// Currently writes to the placeholder service (no-op).
// Replace the service call with the real endpoint when ready.
// ============================================================

import { useEffect, useRef, useCallback } from "react";
import { useWorkshopStore } from "../store/workshopStore";
import { workshopService } from "../services";
import {
  CANVAS_AUTOSAVE_DEBOUNCE_MS,
  CANVAS_AUTOSAVE_INTERVAL_MS,
} from "../constants";

export function useCanvasSync(projectId: string) {
  const objects = useWorkshopStore((s) => s.objects);
  const connections = useWorkshopStore((s) => s.connections);
  const viewport = useWorkshopStore((s) => s.viewport);
  const canvasId = useWorkshopStore((s) => s.canvasId);
  const isDirty = useWorkshopStore((s) => s.isDirty);
  const markClean = useWorkshopStore((s) => s.markClean);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    if (!isDirty || !canvasId) return;
    try {
      await workshopService.saveCanvas(projectId, {
        objects,
        connections,
        viewport,
      });
      markClean();
    } catch {
      // Silently fail — will retry on next dirty change
    }
  }, [isDirty, canvasId, projectId, objects, connections, viewport, markClean]);

  // ── Debounced save on every dirty change ──────────────────
  useEffect(() => {
    if (!isDirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, CANVAS_AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isDirty, save]);

  // ── Fallback autosave every 30s ───────────────────────────
  useEffect(() => {
    const interval = setInterval(save, CANVAS_AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [save]);
}
