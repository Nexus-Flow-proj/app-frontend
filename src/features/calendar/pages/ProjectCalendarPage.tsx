import { useState } from "react";
import { CalendarX2Icon, RotateCcwIcon } from "lucide-react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { MyEmpty } from "@/components/shared/feedback/MyEmpty";
import Loading from "@/components/shared/loading/Loading";
import {
  useActiveFilterCount,
  useResetUrlFilters,
  useSetUrlFilters,
  useUrlFilters,
} from "@/features/boards/hooks/useBoardFilters";
import type { Task } from "@/features/boards/types";
import { useProjectMembers } from "@/features/project/hooks";
import { useAuthStore } from "@/store/authStore";
import { CalendarFilters } from "../components/CalendarFilters";
import { CalendarSummary } from "../components/CalendarSummary";
import { CalendarTaskPreview } from "../components/CalendarTaskPreview";
import { ProjectTaskCalendar } from "../components/ProjectTaskCalendar";
import { useCalendarColorScheme } from "../hooks/useCalendarColorScheme";
import { useProjectCalendarTasks } from "../hooks/useProjectCalendarTasks";
import { mapProjectMemberToCalendarMember } from "../utils/mapProjectMemberToCalendarMember";

export default function ProjectCalendarPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const resolvedProjectId = projectId ?? "";
  const colorScheme = useCalendarColorScheme();
  const currentUserId = useAuthStore((state) => state.user?.id ?? "");
  const filters = useUrlFilters();
  const setFilters = useSetUrlFilters();
  const resetFilters = useResetUrlFilters();
  const activeCount = useActiveFilterCount();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const calendarTasks = useProjectCalendarTasks(
    resolvedProjectId,
    filters,
    currentUserId,
  );
  const projectMembersQuery = useProjectMembers(resolvedProjectId);
  const members =
    projectMembersQuery.data?.map(mapProjectMemberToCalendarMember) ?? [];

  if (calendarTasks.isLoading) {
    return <Loading text="Loading project calendar..." />;
  }

  if (calendarTasks.isError) {
    return (
      <MyEmpty
        title="Calendar unavailable"
        description="The project tasks could not be loaded right now."
        icon={CalendarX2Icon}
      >
        <Button variant="outline" onClick={() => calendarTasks.refetch()}>
          <RotateCcwIcon />
          Retry
        </Button>
      </MyEmpty>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-5 px-1 py-1">
      <section className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Project calendar</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">
              Task schedule
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A read-only calendar of project tasks with due dates.
            </p>
          </div>
          <CalendarFilters
            filters={filters}
            members={members}
            activeCount={activeCount}
            onChangeFilters={setFilters}
            onReset={resetFilters}
          />
        </div>
        <CalendarSummary
          scheduledTaskCount={calendarTasks.scheduledTaskCount}
          totalTaskCount={calendarTasks.totalTaskCount}
        />
      </section>

      {calendarTasks.events.length === 0 ? (
        <MyEmpty
          title={activeCount > 0 ? "No matching tasks" : "No scheduled tasks yet"}
          description={
            activeCount > 0
              ? "Try clearing or loosening the current filters."
              : "Tasks will appear here once they have due dates."
          }
          icon={CalendarX2Icon}
          className="rounded-lg border bg-card"
        >
          {activeCount > 0 && (
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </MyEmpty>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ProjectTaskCalendar
            colorScheme={colorScheme}
            events={calendarTasks.events}
            onTaskClick={setSelectedTask}
          />
          <CalendarTaskPreview task={selectedTask} />
        </section>
      )}
    </main>
  );
}
