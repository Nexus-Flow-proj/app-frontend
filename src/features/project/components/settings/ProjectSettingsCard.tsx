import { FolderKanban } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectDetails } from "../../types";
import { ProjectSettingsForm } from "./ProjectSettingsForm";

interface ProjectSettingsCardProps {
  project: ProjectDetails;
}

export function ProjectSettingsCard({ project }: ProjectSettingsCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FolderKanban className="size-4 text-muted-foreground" />
          Project details
        </CardTitle>
        <CardDescription>
          Changes here update how the project appears across the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <ProjectSettingsForm project={project} />
      </CardContent>
    </Card>
  );
}
