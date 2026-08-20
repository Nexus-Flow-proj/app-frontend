import MyAvatar from "@/components/shared/MyAvatar";
import UserLink from "@/components/shared/UserLink";
import { Badge } from "@/components/ui/badge";
import type { ProjectMemberSummary } from "../../types";
import { isProjectAdmin } from "../../utils/roles";

interface ProjectMemberRowProps {
  member: ProjectMemberSummary;
}

export function ProjectMemberRow({ member }: ProjectMemberRowProps) {
  const displayName =
    `${member.firstName} ${member.lastName}`.trim() || member.email;
  const userId = member.userId ?? member.id;

  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <MyAvatar
          name={displayName}
          avatarUrl={member.avatarUrl ?? undefined}
          userId={userId}
        />
        <div className="min-w-0">
          <UserLink
            userId={userId}
            name={displayName}
            className="truncate text-sm font-semibold text-foreground block"
          />
          <p className="truncate text-xs text-muted-foreground">
            {member.title ? `${member.title} • ${member.email}` : member.email}
          </p>
        </div>
      </div>
      <Badge variant={isProjectAdmin(member) ? "secondary" : "outline"}>
        {member.role?.name ?? member.roleLabel ?? "Project role"}
      </Badge>
    </div>
  );
}
