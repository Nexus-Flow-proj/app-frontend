export const MAX_UNDO_STEPS = 30; // max number of undo snapshots to keep in memory => That means the user can undo the last 30 important changes.

/**
 * Temporary Workshop backend switch.
 *
 * Mock mode is the default until the canvas backend is available. Set
 * VITE_WORKSHOP_MOCK_MODE=false to use the real GET/PATCH canvas endpoints.
 */
export const WORKSHOP_MOCK_MODE =
  import.meta.env.VITE_WORKSHOP_MOCK_MODE !== "false";

// Konva stage behavior
export const CANVAS_GRID_SIZE = 24;
export const CANVAS_MIN_SCALE = 0.15;
export const CANVAS_MAX_SCALE = 3;
export const CANVAS_ZOOM_FACTOR = 1.08;

// Default node sizes (px)
export const NODE_SIZE = {
  TASK_CARD: { w: 220, h: 124 },
  STICKY_NOTE: { w: 188, h: 176 },
  SECTION_FRAME: { w: 560, h: 420 },
} as const;

export const FEATURE_LAYOUT = {
  paddingX: 24,
  contentTop: 96,
  gap: 16,
} as const;
