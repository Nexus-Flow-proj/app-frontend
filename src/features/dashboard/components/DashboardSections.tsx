import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardUiStore } from "../../../store/dashboardUiStore";
import { DashboardDrawer } from "./DashboardDrawer";
import { RecentActivity } from "./RecentActivity";
import { RecentProjects } from "./RecentProjects";
import { StatsGrid } from "./StatsGrid";
import { TaskProgressChart } from "./TaskProgressChart";
import { TodaysFocus } from "./TodaysFocus";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import type { DashboardSummary } from "../types";

const PREVIEW_LIMIT = 4;

interface DashboardSectionsProps {
  data: DashboardSummary | null;
  isLoading: boolean;
}

export function DashboardSections({ data, isLoading }: DashboardSectionsProps) {
  const openDrawer = useDashboardUiStore((s) => s.openDrawer);
  const isDashboardLoading = isLoading || !data;

  return (
    <div className="space-y-5">
      {isDashboardLoading ? (
        <StatsGridSkeleton />
      ) : (
        <StatsGrid stats={data.stats} />
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        <TaskProgressChart isDashboardLoading={isDashboardLoading} />

        {isDashboardLoading ? (
          <Skeleton className="h-80 rounded-lg" />
        ) : (
          <UpcomingDeadlines
            deadlines={data.upcomingDeadlines.slice(0, PREVIEW_LIMIT)}
            onViewAll={
              data.upcomingDeadlines.length > PREVIEW_LIMIT
                ? () => openDrawer("deadlines")
                : undefined
            }
          />
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <TodaysFocus isDashboardLoading={isDashboardLoading} />

        {isDashboardLoading ? (
          <>
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
          </>
        ) : (
          <>
            <RecentActivity
              items={data.recentActivity.slice(0, PREVIEW_LIMIT)}
              onViewAll={
                data.recentActivity.length > PREVIEW_LIMIT
                  ? () => openDrawer("activity")
                  : undefined
              }
            />
            <RecentProjects
              projects={data.recentProjects.slice(0, PREVIEW_LIMIT)}
              onViewAll={
                data.recentProjects.length > PREVIEW_LIMIT
                  ? () => openDrawer("projects")
                  : undefined
              }
            />
          </>
        )}
      </section>

      <DashboardDrawer
        recentActivity={data?.recentActivity ?? []}
        recentProjects={data?.recentProjects ?? []}
        upcomingDeadlines={data?.upcomingDeadlines ?? []}
      />
    </div>
  );
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}
