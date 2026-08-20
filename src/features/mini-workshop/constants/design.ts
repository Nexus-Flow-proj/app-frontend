export const MINI_CANVAS = {
  gridSize: 24,
  minScale: 0.18,
  maxScale: 3,
  zoomFactor: 1.08,
  overscan: 320,
  backgroundLight: "#f8f7fc",
  backgroundDark: "#0b0912",
  gridLight: "rgba(124, 58, 237, 0.20)",
  gridDark: "rgba(167, 139, 250, 0.24)",
  majorGridLight: "rgba(124, 58, 237, 0.07)",
  majorGridDark: "rgba(167, 139, 250, 0.08)",
  ambientLight: "rgba(139, 92, 246, 0.075)",
  ambientDark: "rgba(124, 58, 237, 0.11)",
  primary: "#8b5cf6",
  primaryStrong: "#7c3aed",
  selection: "#9063eb",
  guide: "#22d3ee",
  fontFamily: "Geist Variable",
} as const;

export const MINI_NODE_SIZE = {
  shape: { width: 220, height: 140 },
  text: { width: 260, height: 92 },
  sticky: { width: 220, height: 220 },
  task: { width: 340, height: 170 },
  image: { width: 320, height: 220 },
  frame: { width: 620, height: 420 },
} as const;

export const MINI_STICKY_COLORS = [
  "#fef3c7",
  "#dcfce7",
  "#dbeafe",
  "#fae8ff",
  "#ffe4e6",
] as const;

export const MINI_FILL_COLORS = [
  "#ffffff",
  "#ede9fe",
  "#dbeafe",
  "#dcfce7",
  "#fef3c7",
  "#ffe4e6",
  "#1e293b",
] as const;

export const MINI_STROKE_COLORS = [
  "#64748b",
  "#8b5cf6",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#e11d48",
  "#0f172a",
] as const;

export const MINI_MAX_HISTORY = 50;
