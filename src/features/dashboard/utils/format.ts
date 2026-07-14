import { TaskPriority } from "@/types/enums";

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatDueLabel(isoDate: string): string {
  const due = new Date(isoDate);
  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffDays = Math.round(
    (startOfDay(due) - startOfDay(now)) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 0) return "Overdue";

  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const priorityStyles: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  [TaskPriority.LOW]: {
    label: "Low",
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  [TaskPriority.MEDIUM]: {
    label: "Medium",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  [TaskPriority.HIGH]: {
    label: "High",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  [TaskPriority.URGENT]: {
    label: "Urgent",
    className: "bg-red-600/15 text-red-600 dark:text-red-500",
  },
};