import { ShieldCheck } from "lucide-react";
import type { ProjectDetails } from "../../types";

interface ProjectRolesHeaderProps {
  project: ProjectDetails;
}

export function ProjectRolesHeader({ project }: ProjectRolesHeaderProps) {
  return (
    <header className="flex min-w-0 items-start gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white sm:size-10"
        style={{ backgroundColor: project.color ?? "#2563eb" }}
      >
        <ShieldCheck className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="break-words text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
          {project.name} roles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define role authority, permissions, and member access rules.
        </p>
      </div>
    </header>
  );
}
