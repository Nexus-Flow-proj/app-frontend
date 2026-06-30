import { ROLE_LEVELS } from "../constants/rolePresets";

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
