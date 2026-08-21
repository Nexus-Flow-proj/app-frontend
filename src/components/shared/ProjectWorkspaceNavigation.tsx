import { Boxes, KanbanSquare, Map } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

type Workspace = "workshop" | "board" | "mini-workshop";

interface ProjectWorkspaceNavigationProps {
  projectId?: string | null;
  draftId?: string | null;
  current: Workspace;
  className?: string;
}

interface WorkspaceLink {
  id: Workspace;
  label: string;
  to: string;
  icon: typeof Map;
}

/**
 * Keeps the project execution surfaces connected without inventing a project
 * workshop route. The main workshop is intentionally addressed through its
 * originating draft, while the Board and Mini Workshop are project-scoped.
 */
export function ProjectWorkspaceNavigation({
  projectId,
  draftId,
  current,
  className,
}: ProjectWorkspaceNavigationProps) {
  const links: WorkspaceLink[] = [
    ...(draftId
      ? [
          {
            id: "workshop" as const,
            label: "Workshop",
            to: ROUTES.WORKSHOP(draftId),
            icon: Map,
          },
        ]
      : []),
    ...(projectId
      ? [
          {
            id: "board" as const,
            label: "Board",
            to: ROUTES.BOARDS(projectId),
            icon: KanbanSquare,
          },
          {
            id: "mini-workshop" as const,
            label: "Mini Workshop",
            to: ROUTES.MY_WORKSPACE(projectId),
            icon: Boxes,
          },
        ]
      : []),
  ];

  if (links.length < 2) return null;

  return (
    <div className={cn(`z-50 fixed bottom-20 right-5`, className)}>
      <nav
        aria-label="Project workspaces"
        className="flex flex-col items-center rounded-lg border bg-muted/80 py-1 px-1.5"
      >
        {links.map((link) => {
          const Icon = link.icon;
          const isCurrent = link.id === current;

          return isCurrent ? (
            <Button
              key={link.id}
              type="button"
              className="pointer-events-none gap-1.5 shadow-sm"
              aria-current="page"
            >
              <Icon className="size-3.5" />
              {/* <span className="hidden xl:inline">{link.label}</span> */}
            </Button>
          ) : (
            <Button
              key={link.id}
              asChild
              type="button"
              variant="secondary"
              className="gap-1.5"
            >
              <Link to={link.to}>
                <Icon className="size-3.5" />
                {/* <span className="hidden xl:inline">{link.label}</span> */}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
