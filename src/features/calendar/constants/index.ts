import { TaskPriority } from "@/features/boards/types/enums";
import type { TaskPriority as TaskPriorityValue } from "@/features/boards/types/enums";

export const CALENDAR_PRIORITY_CLASS_NAMES: Record<TaskPriorityValue, string> = {
  [TaskPriority.LOW]: "calendar-event-low",
  [TaskPriority.MEDIUM]: "calendar-event-medium",
  [TaskPriority.HIGH]: "calendar-event-high",
  [TaskPriority.URGENT]: "calendar-event-urgent",
};

export const CALENDAR_PRIORITY_PANEL_CLASS_NAMES: Record<
  TaskPriorityValue,
  string
> = {
  [TaskPriority.LOW]: "from-accent/70 via-accent/20 to-transparent",
  [TaskPriority.MEDIUM]: "from-amber-500/20 via-amber-500/7 to-transparent",
  [TaskPriority.HIGH]: "from-orange-500/22 via-orange-500/8 to-transparent",
  [TaskPriority.URGENT]:
    "from-destructive/22 via-destructive/8 to-transparent",
};
