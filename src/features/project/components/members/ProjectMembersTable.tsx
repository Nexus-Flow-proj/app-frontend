import Loading from "@/components/shared/loading/Loading";
import MyAvatar from "@/components/shared/MyAvatar";
import UserLink from "@/components/shared/UserLink";
import { Badge } from "@/components/ui/badge";
import type { ProjectMemberSummary, ProjectRoleDefinition } from "../../types";
import { getProjectMemberName } from "./member-display";
import { ProjectMemberRow } from "./ProjectMemberRow";
import { ProjectMemberRoleSelect } from "./ProjectMemberRoleSelect";
import { RemoveProjectMemberButton } from "./RemoveProjectMemberButton";

interface ProjectMembersTableProps {
  projectId: string;
  members: ProjectMemberSummary[];
  roles: ProjectRoleDefinition[];
  draftRoleIds?: Record<string, string>;
  currentMember?: ProjectMemberSummary | null;
  canChangeRoles: boolean;
  canRemoveMembers: boolean;
  isLoading?: boolean;
  isBusy?: boolean;
  onRoleChange: (memberId: string, roleId: string) => void;
  onRemove: (projectId: string, memberId: string) => void;
}

export function ProjectMembersTable({
  projectId,
  members,
  roles,
  draftRoleIds = {},
  currentMember,
  canChangeRoles,
  canRemoveMembers,
  isLoading = false,
  isBusy = false,
  onRoleChange,
  onRemove,
}: ProjectMembersTableProps) {
  if (isLoading) {
    return <Loading text="Loading members..." />;
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {members.map((member) => (
          <ProjectMemberMobileCard
            key={member.id}
            member={member}
            roles={roles}
            draftRoleId={draftRoleIds[member.id]}
            currentMember={currentMember}
            canChangeRoles={canChangeRoles}
            canRemoveMembers={canRemoveMembers}
            isBusy={isBusy}
            onRoleChange={onRoleChange}
            onRemove={(memberId) => onRemove(projectId, memberId)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => (
              <ProjectMemberRow
                key={member.id}
                member={member}
                roles={roles}
                draftRoleId={draftRoleIds[member.id]}
                currentMember={currentMember}
                canChangeRoles={canChangeRoles}
                canRemoveMembers={canRemoveMembers}
                isBusy={isBusy}
                onRoleChange={onRoleChange}
                onRemove={(memberId) => onRemove(projectId, memberId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface ProjectMemberMobileCardProps {
  member: ProjectMemberSummary;
  roles: ProjectRoleDefinition[];
  draftRoleId?: string;
  currentMember?: ProjectMemberSummary | null;
  canChangeRoles: boolean;
  canRemoveMembers: boolean;
  isBusy: boolean;
  onRoleChange: (memberId: string, roleId: string) => void;
  onRemove: (memberId: string) => void;
}

function ProjectMemberMobileCard({
  member,
  roles,
  draftRoleId,
  currentMember,
  canChangeRoles,
  canRemoveMembers,
  isBusy,
  onRoleChange,
  onRemove,
}: ProjectMemberMobileCardProps) {
  const memberName = getProjectMemberName(member);
  const currentRoleId = member.roleId ?? member.role?.id;
  const selectedRoleId = draftRoleId ?? currentRoleId;
  const hasDraftRoleChange = !!draftRoleId && draftRoleId !== currentRoleId;
  const isCurrentUser =
    member.id === currentMember?.id ||
    member.userId === currentMember?.userId ||
    member.email === currentMember?.email;

  return (
    <article className="rounded-lg border bg-card p-3">
      <div className="flex min-w-0 items-start gap-3">
        <MyAvatar
          name={memberName}
          avatarUrl={member.avatarUrl ?? undefined}
          userId={member.userId ?? member.id}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <UserLink
              userId={member.userId ?? member.id}
              name={memberName}
              className="block min-w-0 max-w-full truncate font-semibold text-foreground"
            />
            {isCurrentUser && (
              <Badge variant="outline" size="sm">
                You
              </Badge>
            )}
          </div>
          {member.title && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {member.title}
            </p>
          )}
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {member.email}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <div className="grid gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Role
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {canChangeRoles ? (
              <ProjectMemberRoleSelect
                value={selectedRoleId}
                roles={roles}
                disabled={isBusy}
                className="h-9 w-full"
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
        </div>

        {canRemoveMembers && (
          <div className="flex justify-end">
            <RemoveProjectMemberButton
              memberName={memberName}
              disabled={isBusy || isCurrentUser}
              onRemove={() => onRemove(member.id)}
            />
          </div>
        )}
      </div>
    </article>
  );
}
