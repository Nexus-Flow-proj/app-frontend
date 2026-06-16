// features/boards/constants/index.ts

export const DEFAULT_COLUMNS = ["Backlog", "In Progress", "In Review", "Done"];
export const PROTECTED_COLUMNS = ["Backlog", "Done"];

export const PRIORITY_CONFIG = {
  urgent: {
    label: "Urgent",
    textClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/25",
    dotClass: "bg-destructive",
  },
  high: {
    label: "High",
    textClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/25",
    dotClass: "bg-orange-400",
  },
  medium: {
    label: "Medium",
    textClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/25",
    dotClass: "bg-amber-400",
  },
  low: {
    label: "Low",
    textClass: "text-accent-foreground",
    bgClass: "bg-accent/60",
    borderClass: "border-accent-foreground/20",
    dotClass: "bg-accent-foreground",
  },
} as const;

// Uses your CSS variable primary scale
export const COLUMN_ACCENT_COLORS: Record<string, string> = {
  Backlog: "var(--primary)",
  "In Progress": "#f59e0b",
  "In Review": "#8b5cf6",
  Done: "#10b981",
};
