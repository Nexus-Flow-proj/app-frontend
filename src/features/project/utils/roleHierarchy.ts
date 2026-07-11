import { ROLE_LEVELS } from "../constants/rolePresets";
import type { ProjectRoleDefinition } from "../types/roles";

export function sortRolesByLevel(roles: ProjectRoleDefinition[]) {
  return [...roles].sort((a, b) => b.level - a.level);
}

export function canReadRoleContent(
  actorRole: Pick<ProjectRoleDefinition, "level">,
  targetRole: Pick<ProjectRoleDefinition, "level">,
) {
  return targetRole.level >= actorRole.level;
}

export function canEditRoleContent(
  actorRole: Pick<ProjectRoleDefinition, "level">,
  targetRole: Pick<ProjectRoleDefinition, "level">,
  isContentOwner = false,
) {
  return isContentOwner || targetRole.level < actorRole.level;
}

export function canDeleteRoleContent(
  actorRole: Pick<ProjectRoleDefinition, "level">,
  targetRole: Pick<ProjectRoleDefinition, "level">,
  isContentOwner = false,
) {
  return isContentOwner || targetRole.level < actorRole.level;
}

export function isProtectedRole(
  role: Pick<ProjectRoleDefinition, "isSystemRole" | "level">,
) {
  return role.isSystemRole || role.level >= 100;
}

export function getRolesBelow(
  actorRole: Pick<ProjectRoleDefinition, "level">,
  roles: ProjectRoleDefinition[],
) {
  return sortRolesByLevel(
    roles.filter((role) => role.level < actorRole.level),
  );
}

export function getRolesAbove(
  actorRole: Pick<ProjectRoleDefinition, "level">,
  roles: ProjectRoleDefinition[],
) {
  return sortRolesByLevel(
    roles.filter((role) => role.level > actorRole.level),
  );
}

export function getRoleLevelLabel(level: number) {
  const exactLevel = ROLE_LEVELS.find((roleLevel) => roleLevel.value === level);

  if (exactLevel) {
    return exactLevel.label;
  }

  const lowerLevel = [...ROLE_LEVELS]
    .reverse()
    .find((roleLevel) => roleLevel.value < level);

  return lowerLevel ? `Above ${lowerLevel.label}` : "Custom";
}

export function getReadableHierarchyScope(level: number) {
  const readableRoles = ROLE_LEVELS.filter(
    (roleLevel) => roleLevel.value >= level,
  ).map((roleLevel) => roleLevel.label);

  return readableRoles.length > 0 ? readableRoles.join(", ") : "higher roles";
}

export function getEditableHierarchyScope(level: number) {
  const editableRoles = ROLE_LEVELS.filter(
    (roleLevel) => roleLevel.value < level,
  ).map((roleLevel) => roleLevel.label);

  return editableRoles.length > 0
    ? editableRoles.join(", ")
    : "only own content";
}
