import type { User } from "@/types/models/user";
import type { ProjectMemberSummary } from "../types";

export function isProjectAdmin(member?: ProjectMemberSummary | null) {
  return member?.isAdmin === true || (member?.role?.level ?? 0) >= 100;
}

export function findProjectMemberForUser(
  members: ProjectMemberSummary[],
  user?: User | null,
) {
  if (!user) {
    return undefined;
  }

  return members.find(
    (member) =>
      member.userId === user.id ||
      member.email.toLowerCase() === user.email.toLowerCase(),
  );
}
