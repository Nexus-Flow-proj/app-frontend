import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatInitials } from "@/lib/format/text";
import type { ProjectMemberSummary, ProjectRoleDefinition } from "../../types";
import { getProjectMemberName } from "./member-display";
import { ProjectMemberRoleSelect } from "./ProjectMemberRoleSelect";
import { RemoveProjectMemberButton } from "./RemoveProjectMemberButton";

interface ProjectMemberRowProps {
  member: ProjectMemberSummary;
  roles: ProjectRoleDefinition[];
  draftRoleId?: string;
  currentMember?: ProjectMemberSummary | null;
  canChangeRoles: boolean;
  canRemoveMembers: boolean;
  isBusy?: boolean;
  onRoleChange: (memberId: string, roleId: string) => void;
  onRemove: (memberId: string) => void;
}

export function ProjectMemberRow({
  member,
  roles,
  draftRoleId,
  currentMember,
  canChangeRoles,
  canRemoveMembers,
  isBusy = false,
  onRoleChange,
  onRemove,
}: ProjectMemberRowProps) {
  const memberName = getProjectMemberName(member);
  const currentRoleId = member.roleId ?? member.role?.id;
  const selectedRoleId = draftRoleId ?? currentRoleId;
  const hasDraftRoleChange = !!draftRoleId && draftRoleId !== currentRoleId;
  const isCurrentUser =
    member.id === currentMember?.id ||
    member.userId === currentMember?.userId ||
    member.email === currentMember?.email;

  return (
    <tr className="bg-card">
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            {member.avatarUrl && (
              <AvatarImage src={member.avatarUrl} alt={memberName} />
            )}
            <AvatarFallback>{formatInitials(memberName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-foreground">
                {memberName}
              </p>
              {isCurrentUser && (
                <Badge variant="outline" size="sm">
                  You
                </Badge>
              )}
            </div>
            {member.title && (
              <p className="truncate text-xs text-muted-foreground">
                {member.title}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {canChangeRoles ? (
            <ProjectMemberRoleSelect
              value={selectedRoleId}
              roles={roles}
              disabled={isBusy}
              onChange={(roleId) => onRoleChange(member.id, roleId)}
            />
          ) : (
            <Badge variant="outline" size="sm">
              {member.role?.name ?? member.roleLabel ?? "Project role"}
            </Badge>
          )}
          {hasDraftRoleChange && (
            <Badge variant="secondary" size="sm">
              Unsaved
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        {canRemoveMembers && (
          <RemoveProjectMemberButton
            memberName={memberName}
            disabled={isBusy || isCurrentUser}
            onRemove={() => onRemove(member.id)}
          />
        )}
      </td>
    </tr>
  );
}
