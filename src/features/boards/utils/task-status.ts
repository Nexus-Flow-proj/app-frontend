import { STATUS_CONFIG } from "../constants";
import { TaskStatus, type TaskStatus as TaskStatusValue } from "../types/enums";

const COLUMN_STATUS_ALIASES: Record<string, TaskStatusValue> = {
  backlog: TaskStatus.BACKLOG,
  "to do": TaskStatus.TODO,
  todo: TaskStatus.TODO,
  "in progress": TaskStatus.IN_PROGRESS,
  progress: TaskStatus.IN_PROGRESS,
  "in review": TaskStatus.IN_REVIEW,
  review: TaskStatus.IN_REVIEW,
  done: TaskStatus.DONE,
};

export const TASK_STATUSES = Object.values(TaskStatus);

export function getTaskStatusLabel(status: TaskStatusValue) {
  return STATUS_CONFIG[status]?.label ?? status;
}

export function getTaskStatusFromColumnName(
  columnName: string | undefined,
  fallback: TaskStatusValue = TaskStatus.TODO,
) {
  if (!columnName) return fallback;

  const normalized = columnName.trim().toLowerCase().replace(/[-_]+/g, " ");
  return COLUMN_STATUS_ALIASES[normalized] ?? fallback;
}
