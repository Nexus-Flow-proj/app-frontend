import { Link } from "react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
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
      <CardHeader className="gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-6">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Roles & permissions
          </CardTitle>
          <CardDescription>
            Configure project role presets, hierarchy levels, and action access.
          </CardDescription>
        </div>
        <div className="w-full sm:w-auto sm:justify-self-end">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={`/projects/${project.id}/roles`}>Manage roles</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
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
