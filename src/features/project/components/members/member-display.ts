import type { ProjectMemberSummary } from "../../types";
import { isProjectOwner } from "../../utils/roles";

export function getProjectMemberName(member: ProjectMemberSummary) {
  return (
    [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
    member.email
  );
}

export function sortProjectMembers(members: ProjectMemberSummary[]) {
  return [...members].sort((a, b) => {
    if (isProjectOwner(a) && !isProjectOwner(b)) return -1;
    if (!isProjectOwner(a) && isProjectOwner(b)) return 1;
    return getProjectMemberName(a).localeCompare(getProjectMemberName(b));
  });
}
