import { ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User, ProjectRole } from "@/types";
import type { ProjectMemberSummary } from "../../types";
import { ProjectMembersTable } from "./ProjectMembersTable";

interface ProjectMembersTableCardProps {
  projectId: string;
  members: ProjectMemberSummary[];
  currentUser?: User | null;
  isLoading?: boolean;
  isBusy?: boolean;
  onRoleChange: (projectId: string, memberId: string, role: ProjectRole) => void;
  onRemove: (projectId: string, memberId: string) => void;
}

export function ProjectMembersTableCard({
  projectId,
  members,
  currentUser,
  isLoading = false,
  isBusy = false,
  onRoleChange,
  onRemove,
}: ProjectMembersTableCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" />
          Project members
        </CardTitle>
        <CardDescription>
          {members.length} active member{members.length === 1 ? "" : "s"} in
          this project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectMembersTable
          projectId={projectId}
          members={members}
          currentUser={currentUser}
          isLoading={isLoading}
          isBusy={isBusy}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      </CardContent>
    </Card>
  );
}
