// Canvas persistence — per AGENT.md spec
export const CANVAS_AUTOSAVE_DEBOUNCE_MS = 1500;
export const CANVAS_AUTOSAVE_INTERVAL_MS = 30_000;
export const MAX_UNDO_STEPS = 30; // max number of undo snapshots to keep in memory => That means the user can undo the last 30 important changes.

// Konva stage behavior
export const CANVAS_GRID_SIZE = 24;
export const CANVAS_MIN_SCALE = 0.15;
export const CANVAS_MAX_SCALE = 3;
export const CANVAS_ZOOM_FACTOR = 1.08;

// Layout geometry
export const SIDEBAR_WIDTH = 260; // px — left sidebar
export const TOOLBAR_WIDTH = 56; // px — vertical icon toolbar

// Connection defaults
export const CONNECTION_COLOR = "#9063EB"; // primary-500
export const CONNECTION_STROKE_WIDTH = 2;
export const CONNECTION_DASH = [6, 4];

// Status badge colors  (bg / text / dot)
export const STATUS_CONFIG = {
  BACKLOG: { label: "Backlog", bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" },
  TODO: { label: "To Do", bg: "#EFF6FF", text: "#3B82F6", dot: "#60A5FA" },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "#F0EAFF",
    text: "#7A4FD4",
    dot: "#9063EB",
  },
  IN_REVIEW: {
    label: "In Review",
    bg: "#FFF7ED",
    text: "#F97316",
    dot: "#FB923C",
  },
  DONE: { label: "Done", bg: "#F0FDF4", text: "#16A34A", dot: "#4ADE80" },
} as const;

// Priority badge colors
export const PRIORITY_CONFIG = {
  LOW: { label: "Low", bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8" },
  MEDIUM: { label: "Medium", bg: "#EFF6FF", text: "#3B82F6", dot: "#60A5FA" },
  HIGH: { label: "High", bg: "#FFF7ED", text: "#F97316", dot: "#FB923C" },
  URGENT: { label: "Urgent", bg: "#FFF1F2", text: "#EF4444", dot: "#F87171" },
} as const;

// Sticky note color choices
export const STICKY_COLORS = [
  "#FEF08A",
  "#86EFAC",
  "#93C5FD",
  "#F9A8D4",
  "#FCA5A5",
  "#D8B4FE",
  "#FCD34D",
  "#6EE7B7",
] as const;

// Section frame color presets
export const SECTION_PRESETS = [
  { bg: "#F0EAFF", border: "#C4AFF7", label: "Violet" },
  { bg: "#EFF6FF", border: "#BFDBFE", label: "Blue" },
  { bg: "#F0FDF4", border: "#BBF7D0", label: "Green" },
  { bg: "#FFF7ED", border: "#FED7AA", label: "Orange" },
  { bg: "#FDF2F8", border: "#F5D0FE", label: "Pink" },
] as const;

// Default node sizes (px)
export const NODE_SIZE = {
  TASK_CARD: { w: 240, h: 130 },
  STICKY_NOTE: { w: 200, h: 200 },
  SECTION_FRAME: { w: 420, h: 300 },
  IMAGE_BLOCK: { w: 240, h: 160 },
} as const;
