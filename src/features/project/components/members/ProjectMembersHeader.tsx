import { UsersRound } from "lucide-react";
import type { ProjectDetails } from "../../types";

interface ProjectMembersHeaderProps {
  project: ProjectDetails;
}

export function ProjectMembersHeader({ project }: ProjectMembersHeaderProps) {
  return (
    <header className="flex min-w-0 items-start gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white sm:size-10"
        style={{ backgroundColor: project.color ?? "#2563eb" }}
      >
        <UsersRound className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="break-words text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
          {project.name} members
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite teammates, update roles, and remove project access.
        </p>
      </div>
    </header>
  );
}
