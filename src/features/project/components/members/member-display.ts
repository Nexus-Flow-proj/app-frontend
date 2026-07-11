import type { ProjectMemberSummary } from "../../types";
import { isProjectAdmin } from "../../utils/roles";

export function getProjectMemberName(member: ProjectMemberSummary) {
  return (
    [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
    member.email
  );
}

export function sortProjectMembers(members: ProjectMemberSummary[]) {
  return [...members].sort((a, b) => {
    if (isProjectAdmin(a) && !isProjectAdmin(b)) return -1;
    if (!isProjectAdmin(a) && isProjectAdmin(b)) return 1;
    return getProjectMemberName(a).localeCompare(getProjectMemberName(b));
  });
}
