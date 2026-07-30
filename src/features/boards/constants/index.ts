import { TaskPriority, TaskStatus } from "../types/enums";

export const DEFAULT_COLUMNS = ["Backlog", "In Progress", "In Review", "Done"];
export const PROTECTED_COLUMNS = ["Backlog", "Done"];

export const PRIORITY_CONFIG = {
  [TaskPriority.URGENT]: {
    label: "Urgent",
    textClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/25",
    dotClass: "bg-destructive",
  },
  [TaskPriority.HIGH]: {
    label: "High",
    textClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/25",
    dotClass: "bg-orange-400",
  },
  [TaskPriority.MEDIUM]: {
    label: "Medium",
    textClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/25",
    dotClass: "bg-amber-400",
  },
  [TaskPriority.LOW]: {
    label: "Low",
    textClass: "text-accent-foreground",
    bgClass: "bg-accent/60",
    borderClass: "border-accent-foreground/20",
    dotClass: "bg-accent-foreground",
  },
} as const;

export const STATUS_CONFIG = {
  [TaskStatus.BACKLOG]: {
    label: "Backlog",
    dotClass: "bg-slate-400",
  },
  [TaskStatus.TODO]: {
    label: "To Do",
    dotClass: "bg-sky-400",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    dotClass: "bg-violet-400",
  },
  [TaskStatus.IN_REVIEW]: {
    label: "In Review",
    dotClass: "bg-orange-400",
  },
  [TaskStatus.DONE]: {
    label: "Done",
    dotClass: "bg-emerald-400",
  },
} as const;

export const COLUMN_ACCENT_COLORS: Record<string, string> = {
  Backlog: "var(--primary)",
  "In Progress": "var(--chart-4)",
  "In Review": "var(--chart-2)",
  Done: "var(--chart-3)",
};
