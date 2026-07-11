import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberRole } from "@/types/enums";
import { ROUTES } from "@/constants";
import type { RecentProjectSummary } from "../types";

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
  const navigate = useNavigate();
  const textClass = truncate ? "truncate" : "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Recent Projects</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => navigate(ROUTES.PROJECT_OVERVIEW(project.id))}
                className="cursor-pointer rounded-lg -mx-1 px-1 py-0.5 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.charAt(0)}
                    </span>
                    <p
                      className={`text-sm text-foreground ${textClass}`}
                      title={truncate ? project.name : undefined}
                    >
                      {project.name}
                    </p>
                  </div>
                  <Badge
                    variant={
                      project.role === MemberRole.ADMIN
                        ? "default"
                        : "secondary"
                    }
                  >
                    {project.role === MemberRole.ADMIN ? "Admin" : "Member"}
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
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}