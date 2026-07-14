import { useMemo, useState } from "react";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBulkUpdateProjectMemberRoles } from "../../hooks";
import type { ProjectMemberSummary, ProjectRoleDefinition } from "../../types";
import { ProjectMembersTable } from "./ProjectMembersTable";

interface ProjectMembersTableCardProps {
  projectId: string;
  members: ProjectMemberSummary[];
  roles: ProjectRoleDefinition[];
  currentMember?: ProjectMemberSummary | null;
  canChangeRoles: boolean;
  canRemoveMembers: boolean;
  isLoading?: boolean;
  isBusy?: boolean;
  onRemove: (projectId: string, memberId: string) => void;
}

export function ProjectMembersTableCard({
  projectId,
  members,
  roles,
  currentMember,
  canChangeRoles,
  canRemoveMembers,
  isLoading = false,
  isBusy = false,
  onRemove,
}: ProjectMembersTableCardProps) {
  const [draftRoleIds, setDraftRoleIds] = useState<Record<string, string>>({});
  const { mutate: bulkUpdateRoles, isPending: isSavingRoles } =
    useBulkUpdateProjectMemberRoles();

  const roleAssignments = useMemo(
    () =>
      members
        .map((member) => {
          const currentRoleId = member.roleId ?? member.role?.id;
          const draftRoleId = draftRoleIds[member.id];

          if (!draftRoleId || draftRoleId === currentRoleId) {
            return null;
          }

          return {
            memberId: member.id,
            roleId: draftRoleId,
          };
        })
        .filter(
          (
            assignment,
          ): assignment is {
            memberId: string;
            roleId: string;
          } => !!assignment,
        ),
    [draftRoleIds, members],
  );
  const hasRoleChanges = canChangeRoles && roleAssignments.length > 0;
  const isTableBusy = isBusy || isSavingRoles;

  function handleDraftRoleChange(memberId: string, roleId: string) {
    if (!canChangeRoles) {
      return;
    }

    const member = members.find((item) => item.id === memberId);
    const currentRoleId = member?.roleId ?? member?.role?.id;

    setDraftRoleIds((current) => {
      const next = { ...current };

      if (!currentRoleId || roleId === currentRoleId) {
        delete next[memberId];
        return next;
      }

      next[memberId] = roleId;
      return next;
    });
  }

  function handleDiscardRoleChanges() {
    setDraftRoleIds({});
  }

  function handleSaveRoleChanges() {
    if (!hasRoleChanges) {
      return;
    }

    bulkUpdateRoles(
      { projectId, assignments: roleAssignments },
      { onSuccess: () => setDraftRoleIds({}) },
    );
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Project members
          </CardTitle>
          <CardDescription>
            {members.length} active member{members.length === 1 ? "" : "s"} in
            this project.
          </CardDescription>
        </div>
        {canChangeRoles && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasRoleChanges || isTableBusy}
              onClick={handleDiscardRoleChanges}
            >
              <RotateCcw className="size-3.5" />
              Discard changes
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!hasRoleChanges || isBusy}
              isLoading={isSavingRoles}
              onClick={handleSaveRoleChanges}
            >
              <Save className="size-3.5" />
              Save changes
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ProjectMembersTable
          projectId={projectId}
          members={members}
          roles={roles}
          draftRoleIds={draftRoleIds}
          currentMember={currentMember}
          canChangeRoles={canChangeRoles}
          canRemoveMembers={canRemoveMembers}
          isLoading={isLoading}
          isBusy={isTableBusy}
          onRoleChange={handleDraftRoleChange}
          onRemove={onRemove}
        />
      </CardContent>
    </Card>
  );
}
