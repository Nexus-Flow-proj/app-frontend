import type { Task } from "@/features/boards/types";

export type CalendarColorScheme = "light" | "dark";

export interface CalendarTaskEventProps {
  task: Task;
}
