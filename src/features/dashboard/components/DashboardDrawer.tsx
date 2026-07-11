import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDashboardUiStore } from "../store/dashboardUiStore";
import { RecentActivity } from "./RecentActivity";
import { RecentProjects } from "./RecentProjects";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import type {
  RecentActivityItem,
  RecentProjectSummary,
  UpcomingDeadline,
} from "../types";

interface DashboardDrawerProps {
  recentActivity: RecentActivityItem[];
  recentProjects: RecentProjectSummary[];
  upcomingDeadlines: UpcomingDeadline[];
}

const DRAWER_TITLES: Record<string, string> = {
  activity: "Recent Activity",
  projects: "Recent Projects",
  deadlines: "Upcoming Deadlines",
};

/**
 * One reusable drawer, driven entirely by `activeDrawer` in the zustand
 * store. Any "View all" button anywhere just calls `openDrawer("activity" |
 * "projects" | "deadlines")` - no per-section drawer components needed.
 *
 * Reuses the same list data already fetched with the dashboard summary - no
 * extra request. If the lists ever grow beyond what the summary returns,
 * this is the place to add a dedicated "fetch full list" query per drawer
 * type instead.
 */
export function DashboardDrawer({
  recentActivity,
  recentProjects,
  upcomingDeadlines,
}: DashboardDrawerProps) {
  const activeDrawer = useDashboardUiStore((s) => s.activeDrawer);
  const closeDrawer = useDashboardUiStore((s) => s.closeDrawer);

  return (
    <Sheet
      open={activeDrawer !== null}
      onOpenChange={(open) => !open && closeDrawer()}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {activeDrawer ? DRAWER_TITLES[activeDrawer] : "Details"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {activeDrawer === "activity" && (
            <RecentActivity items={recentActivity} truncate={false} />
          )}
          {activeDrawer === "projects" && (
            <RecentProjects projects={recentProjects} truncate={false} />
          )}
          {activeDrawer === "deadlines" && (
            <UpcomingDeadlines
              deadlines={upcomingDeadlines}
              truncate={false}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}