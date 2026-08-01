import FullCalendar, {
  type EventClickInfo,
  type EventDisplayInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import listPlugin from "@fullcalendar/react/list";
import pulseThemePlugin from "@fullcalendar/react/themes/pulse";
import type { EventInput } from "@fullcalendar/react";
import type { Task } from "@/features/boards/types";
import { CalendarTaskEvent } from "./CalendarTaskEvent";
import type { CalendarColorScheme } from "../types";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/pulse/theme.css";
import "@fullcalendar/react/themes/pulse/palettes/purple.css";
import "../styles/fullcalendar.css";

interface ProjectTaskCalendarProps {
  colorScheme: CalendarColorScheme;
  events: EventInput[];
  onTaskClick?: (task: Task) => void;
}

function getTaskFromEventInfo(info: EventDisplayInfo | EventClickInfo) {
  return info.event.extendedProps.task as Task | undefined;
}

export function ProjectTaskCalendar({
  colorScheme,
  events,
  onTaskClick,
}: ProjectTaskCalendarProps) {
  return (
    <div className="project-calendar min-h-[680px] rounded-lg border bg-card p-3 text-card-foreground shadow-xs">
      <FullCalendar
        plugins={[pulseThemePlugin, dayGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        colorScheme={colorScheme}
        events={events}
        height="auto"
        expandRows
        dayMaxEvents={3}
        moreLinkClick="popover"
        navLinks
        fixedWeekCount={false}
        eventDisplay="block"
        eventClick={(info) => {
          const task = getTaskFromEventInfo(info);
          if (task) onTaskClick?.(task);
        }}
        eventContent={(info) => {
          const task = getTaskFromEventInfo(info);
          return task ? <CalendarTaskEvent task={task} /> : info.event.title;
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listWeek",
        }}
      />
    </div>
  );
}
