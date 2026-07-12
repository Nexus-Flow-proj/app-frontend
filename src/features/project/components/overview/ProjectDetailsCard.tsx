import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dateformat } from "@/lib/format/date";
import type { ProjectDetails } from "../../types";
import { ProjectDetailRow } from "./ProjectDetailRow";

interface ProjectDetailsCardProps {
  project: ProjectDetails;
  adminName: string;
  createdAt: string;
  updatedAt: string;
}

export function ProjectDetailsCard({
  project,
  adminName,
  createdAt,
  updatedAt,
}: ProjectDetailsCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Project details</CardTitle>
        <CardDescription>Source data from the project record.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        <ProjectDetailRow label="Project admin" value={adminName} />
        <ProjectDetailRow label="Status" value={project.status} />
        <ProjectDetailRow
          label="Deadline"
          value={project.deadline ? dateformat(project.deadline) : "None"}
        />
        <ProjectDetailRow
          label="Created"
          value={createdAt ? dateformat(createdAt) : "Unknown"}
        />
        <ProjectDetailRow
          label="Last updated"
          value={updatedAt ? dateformat(updatedAt) : "Unknown"}
        />
      </CardContent>
    </Card>
  );
}
