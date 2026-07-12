import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import type { RecentProjectSummary } from "../types";
import { DashboardCard } from "./DashboardCard";

interface RecentProjectsProps {
  projects: RecentProjectSummary[];
  onViewAll?: () => void;
  /** false inside the drawer, where there's room to show the full text */
  truncate?: boolean;
}

export function RecentProjects({
  projects,
  onViewAll,
  truncate = true,
}: RecentProjectsProps) {
  const textClass = truncate ? "truncate" : "";

  return (
    <DashboardCard
      title="Recent projects"
      action={
        onViewAll ? (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        ) : null
      }
    >
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => {
            const isAdminRole = project.role.toLowerCase().includes("admin");

            return (
              <li key={project.id}>
                <Link
                  to={ROUTES.PROJECT_OVERVIEW(project.id)}
                  className="-mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0)}
                      </span>
                      <p
                        className={`text-sm font-medium text-foreground ${textClass}`}
                        title={truncate ? project.name : undefined}
                      >
                        {project.name}
                      </p>
                    </div>
                    <Badge variant={isAdminRole ? "default" : "secondary"}>
                      {isAdminRole ? "Admin" : project.role}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
