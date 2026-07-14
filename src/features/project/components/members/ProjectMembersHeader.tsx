import { UsersRound } from "lucide-react";
import type { ProjectDetails } from "../../types";

interface ProjectMembersHeaderProps {
  project: ProjectDetails;
}

export function ProjectMembersHeader({ project }: ProjectMembersHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: project.color ?? "#2563eb" }}
      >
        <UsersRound className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
          {project.name} members
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite teammates, update roles, and remove project access.
        </p>
      </div>
    </header>
  );
}
