import { ProjectRole } from "@/types";
import type { User } from "@/types/models/user";
import type { ProjectMemberSummary } from "../types";

export function isProjectOwner(member?: ProjectMemberSummary | null) {
  return member?.roleLabel === ProjectRole.OWNER || member?.isAdmin === true;
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
