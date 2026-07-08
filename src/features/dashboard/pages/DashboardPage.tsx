import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { useDashboardUiStore } from "../store/dashboardUiStore";
import { DashboardDrawer } from "../components/DashboardDrawer";
import { StatsGrid } from "../components/StatsGrid";
import { TaskProgressChart } from "../components/TaskProgressChart";
import { UpcomingDeadlines } from "../components/UpcomingDeadlines";
import { TodaysFocus } from "../components/TodaysFocus";
import { RecentActivity } from "../components/RecentActivity";
import { RecentProjects } from "../components/RecentProjects";
import { useAuthStore } from "@/store/authStore";

// How many items the compact dashboard cards show before "View all" is
// needed. The drawer always shows the complete list regardless of this.
const PREVIEW_LIMIT = 4;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useDashboardSummary();
  const openDrawer = useDashboardUiStore((s) => s.openDrawer);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background px-6 py-2 lg:px-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {user?.firstName || "there"}! 
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your work today.
          </p>
        </div>

        {/* No context needed to create a project (unlike "New Task", which
            would need a project + column picked first) - safe default here.
            NOTE: wire this to your actual project-creation route/dialog,
            "/projects/new" is a placeholder. */}
        <Button onClick={() => navigate("/projects/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </header>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Couldn't load your dashboard
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {isLoading || !data ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <StatsGrid stats={data.stats} />
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Mounted unconditionally so it starts fetching in parallel
                with the summary instead of waiting for it. Manages its own
                loading/error state internally. */}
            <TaskProgressChart />

            {isLoading || !data ? (
              <Skeleton className="h-80 rounded-2xl" />
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
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Same as TaskProgressChart - mounted unconditionally,
                fetches + mutates independently of the summary. */}
            <TodaysFocus />

            {isLoading || !data ? (
              <>
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
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
          </div>

          {/* Drawer always gets the FULL, un-sliced lists. Empty arrays
              until the summary resolves - fine, since the drawer can only
              be opened from buttons that only render once data exists. */}
          <DashboardDrawer
            recentActivity={data?.recentActivity ?? []}
            recentProjects={data?.recentProjects ?? []}
            upcomingDeadlines={data?.upcomingDeadlines ?? []}
          />
        </div>
      )}
    </div>
  );
}

export { DashboardPage };
export default DashboardPage;