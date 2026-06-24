import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatInitials } from "@/lib/format/text";
import type { ProjectMemberSummary } from "../../types";

interface ProjectMemberRowProps {
  member: ProjectMemberSummary;
}

export function ProjectMemberRow({ member }: ProjectMemberRowProps) {
  const displayName =
    `${member.firstName} ${member.lastName}`.trim() || member.email;

  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarImage src={member.avatarUrl ?? undefined} />
          <AvatarFallback>{formatInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {member.title ? `${member.title} • ${member.email}` : member.email}
          </p>
        </div>
      </div>
      <Badge variant={member.isAdmin ? "secondary" : "outline"}>
        {member.roleLabel}
      </Badge>
    </div>
  );
}
