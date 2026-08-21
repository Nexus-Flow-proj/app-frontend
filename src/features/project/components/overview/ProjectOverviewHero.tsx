import {
  BoxesIcon,
  KanbanSquareIcon,
  Settings2Icon,
  SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { dateformat } from "@/lib/format/date";
import { formatInitials } from "@/lib/format/text";
import type { ProjectDetails } from "../../types";

interface ProjectOverviewHeroProps {
  project: ProjectDetails;
  createdAt: string;
  canOpenWorkshop: boolean;
  canOpenBoard: boolean;
  canOpenMiniWorkshop: boolean;
  canManageSettings: boolean;
  onNavigate: (to: string) => void;
}

export function ProjectOverviewHero({
  project,
  createdAt,
  canOpenWorkshop,
  canOpenBoard,
  canOpenMiniWorkshop,
  canManageSettings,
  onNavigate,
}: ProjectOverviewHeroProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 gap-4">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white shadow-sm ring-1 ring-foreground/10"
          style={{ backgroundColor: project.color ?? "#2563eb" }}
        >
          {formatInitials(project.name)}
        </div>
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{project.status}</Badge>
            {createdAt && (
              <span className="text-xs text-muted-foreground">
                Created {dateformat(createdAt)}
              </span>
            )}
            {project.deadline && (
              <span className="text-xs text-muted-foreground">
                Deadline {dateformat(project.deadline)}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            {project.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {project.description ||
              "No description yet. Add more context from project settings when the team is ready."}
          </p>
        </div>
      </div>

      <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-72">
        {canOpenWorkshop && (
          <Button
            size="lg"
            className="justify-center gap-2"
            onClick={() => onNavigate(ROUTES.WORKSHOP(project.draftId))}
          >
            <SparklesIcon data-icon="inline-start" className="size-4" />
            <span>Workshop</span>
          </Button>
        )}
        {canOpenBoard && (
          <Button
            size="lg"
            variant="surface"
            className="justify-center gap-2"
            onClick={() => onNavigate(ROUTES.BOARDS(project.id))}
          >
            <KanbanSquareIcon data-icon="inline-start" className="size-4" />
            <span>Board</span>
          </Button>
        )}
        {canOpenMiniWorkshop && (
          <Button
            size="lg"
            variant="surface"
            className="justify-center gap-2"
            onClick={() => onNavigate(ROUTES.MY_WORKSPACE(project.id))}
          >
            <BoxesIcon data-icon="inline-start" className="size-4" />
            <span>Mini Workshop</span>
          </Button>
        )}
        {canManageSettings && (
          <Button
            size="lg"
            variant="surface"
            className="justify-center gap-2"
            onClick={() => onNavigate(ROUTES.PROJECT_SETTINGS(project.id))}
          >
            <Settings2Icon data-icon="inline-start" className="size-4" />
            <span>Settings</span>
          </Button>
        )}
      </div>
    </div>
  );
}
