import type { CalendarTaskEventProps } from "../types";

export function CalendarTaskEvent({ task }: CalendarTaskEventProps) {
  return (
    <div className="flex min-w-0 w-full items-center overflow-hidden rounded-md bg-primary px-2.5 py-1.5 text-primary-foreground shadow-sm">
      <span className="calendar-event-title min-w-0 flex-1 truncate text-sm font-bold leading-5">
        {task.title}
      </span>
    </div>
  );
}
