import { useMemo } from "react";
import { taskMatchesFilters } from "@/features/boards/hooks/useBoardFilters";
import { useProjectTasks } from "@/features/boards/hooks/useProjectTasks";
import type { BoardFiltersState } from "@/features/boards/types";
import type { Task } from "@/features/boards/types";
import { mapTasksToCalendarEvents } from "../utils/mapTasksToCalendarEvents";

const EMPTY_TASKS: Task[] = [];

export function useProjectCalendarTasks(
  projectId: string,
  filters: BoardFiltersState,
  currentUserId: string,
) {
  const tasksQuery = useProjectTasks(projectId);
  const tasks = tasksQuery.data?.tasks ?? EMPTY_TASKS;

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) =>
        taskMatchesFilters(task, filters, currentUserId),
      ),
    [currentUserId, filters, tasks],
  );

  const events = useMemo(
    () => mapTasksToCalendarEvents(filteredTasks),
    [filteredTasks],
  );

  const scheduledTaskCount = events.length;
  const totalTaskCount = filteredTasks.length;

  return {
    ...tasksQuery,
    events,
    filteredTasks,
    filteredTaskCount: filteredTasks.length,
    scheduledTaskCount,
    totalTaskCount,
    totalProjectTaskCount: tasks.length,
  };
}
