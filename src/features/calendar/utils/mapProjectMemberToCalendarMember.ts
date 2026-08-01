import type { BoardMember } from "@/features/boards/types";
import type { ProjectMemberSummary } from "@/features/project/types";

export function mapProjectMemberToCalendarMember(
  member: ProjectMemberSummary,
): BoardMember {
  const name = `${member.firstName} ${member.lastName}`.trim() || member.email;

  return {
    id: member.userId,
    name,
    avatarUrl: member.avatarUrl ?? undefined,
    avatar: member.avatarUrl ?? undefined,
    isActive: member.isOnline,
  };
}
