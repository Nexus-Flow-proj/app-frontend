// features/boards/constants/index.ts

export const DEFAULT_COLUMNS = ["Backlog", "In Progress", "In Review", "Done"];
export const PROTECTED_COLUMNS = ["Backlog", "Done"];

export const PRIORITY_CONFIG = {
  urgent: {
    label: "Urgent",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  low: {
    label: "Low",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
} as const;

export const COLUMN_ACCENT_COLORS: Record<string, string> = {
  Backlog: "#6366f1",
  "In Progress": "#f59e0b",
  "In Review": "#8b5cf6",
  Done: "#10b981",
};
