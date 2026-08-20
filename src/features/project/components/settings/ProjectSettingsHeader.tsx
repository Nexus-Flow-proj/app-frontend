import { Settings2 } from "lucide-react";
import type { ProjectDetails } from "../../types";

interface ProjectSettingsHeaderProps {
  project: ProjectDetails;
}

export function ProjectSettingsHeader({ project }: ProjectSettingsHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: project.color ?? "#2563eb" }}
      >
        <Settings2 className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">
          {project.name} settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update this project&apos;s basic details and visual identity.
        </p>
      </div>
    </header>
  );
}
