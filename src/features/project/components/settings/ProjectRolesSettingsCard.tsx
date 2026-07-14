import { Link } from "react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectDetails } from "../../types";

interface ProjectRolesSettingsCardProps {
  project: ProjectDetails;
}

export function ProjectRolesSettingsCard({
  project,
}: ProjectRolesSettingsCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" />
          Roles & permissions
        </CardTitle>
        <CardDescription>
          Configure project role presets, hierarchy levels, and action access.
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline">
            <Link to={`/projects/${project.id}/roles`}>Manage roles</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="font-medium text-foreground">Permissions</p>
            <p className="mt-1">Choose what each role can do.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Hierarchy</p>
            <p className="mt-1">Scope edits and deletes by authority level.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Presets</p>
            <p className="mt-1">Start from common team roles.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
