import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDashboardUiStore } from "../../../store/dashboardUiStore";
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
  activity: "Recent activity",
  projects: "Recent projects",
  deadlines: "Upcoming deadlines",
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
  const itemCount =
    activeDrawer === "activity"
      ? recentActivity.length
      : activeDrawer === "projects"
        ? recentProjects.length
        : activeDrawer === "deadlines"
          ? upcomingDeadlines.length
          : 0;

  return (
    <Sheet
      open={activeDrawer !== null}
      onOpenChange={(open) => !open && closeDrawer()}
    >
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle className="text-lg font-semibold">
            {activeDrawer ? DRAWER_TITLES[activeDrawer] : "Details"}
          </SheetTitle>
          <SheetDescription>
            {itemCount} {itemCount === 1 ? "item" : "items"} from your dashboard
            summary
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {activeDrawer === "activity" && (
            <RecentActivity
              items={recentActivity}
              truncate={false}
              variant="sheet"
            />
          )}
          {activeDrawer === "projects" && (
            <RecentProjects projects={recentProjects} truncate={false} />
          )}
          {activeDrawer === "deadlines" && (
            <UpcomingDeadlines deadlines={upcomingDeadlines} truncate={false} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
