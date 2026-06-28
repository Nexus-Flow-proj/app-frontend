import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatInitials } from "@/lib/format/text";
import type { User, ProjectRole } from "@/types";
import type { ProjectMemberSummary } from "../../types";
import { getProjectMemberName } from "./member-display";
import { ProjectMemberRoleSelect } from "./ProjectMemberRoleSelect";
import { RemoveProjectMemberButton } from "./RemoveProjectMemberButton";

interface ProjectMemberRowProps {
  member: ProjectMemberSummary;
  currentUser?: User | null;
  isBusy?: boolean;
  onRoleChange: (memberId: string, role: ProjectRole) => void;
  onRemove: (memberId: string) => void;
}

export function ProjectMemberRow({
  member,
  currentUser,
  isBusy = false,
  onRoleChange,
  onRemove,
}: ProjectMemberRowProps) {
  const memberName = getProjectMemberName(member);
  const isCurrentUser =
    member.userId === currentUser?.id || member.email === currentUser?.email;

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
        <ProjectMemberRoleSelect
          value={member.roleLabel}
          disabled={isBusy}
          onChange={(role) => onRoleChange(member.id, role)}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <RemoveProjectMemberButton
          memberName={memberName}
          disabled={isBusy || isCurrentUser}
          onRemove={() => onRemove(member.id)}
        />
      </td>
    </tr>
  );
}
