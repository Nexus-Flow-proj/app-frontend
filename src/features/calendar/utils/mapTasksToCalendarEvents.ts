import type { EventInput } from "@fullcalendar/react";
import type { Task } from "@/features/boards/types";
import { CALENDAR_PRIORITY_CLASS_NAMES } from "../constants";

export function mapTasksToCalendarEvents(tasks: Task[]): EventInput[] {
  return tasks
    .filter((task) => Boolean(task.dueDate))
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate,
      allDay: true,
      classNames: [CALENDAR_PRIORITY_CLASS_NAMES[task.priority]],
      extendedProps: {
        task,
      },
    }));
}
