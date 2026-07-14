import { ShieldCheck } from "lucide-react";
import type { ProjectDetails } from "../../types";

interface ProjectRolesHeaderProps {
  project: ProjectDetails;
}

export function ProjectRolesHeader({ project }: ProjectRolesHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: project.color ?? "#2563eb" }}
      >
        <ShieldCheck className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
          {project.name} roles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define role authority, permissions, and member access rules.
        </p>
      </div>
    </header>
  );
}
