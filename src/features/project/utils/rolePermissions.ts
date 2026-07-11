import { ROLE_PERMISSION_GROUPS } from "../constants/rolePresets";
import type {
  PermissionGroupKey,
  ProjectRoleDefinition,
  RolePermissions,
} from "../types/roles";

export type RolePermissionPath = {
  [TGroup in PermissionGroupKey]: `${TGroup}.${Extract<
    keyof RolePermissions[TGroup],
    string
  >}`;
}[PermissionGroupKey];

export function hasPermission(
  role: Pick<ProjectRoleDefinition, "permissions">,
  permissionPath: RolePermissionPath,
) {
  const [groupKey, permissionKey] = permissionPath.split(".") as [
    PermissionGroupKey,
    string,
  ];

  const permissionGroup = role.permissions[groupKey];

  return Boolean(
    permissionGroup?.[
      permissionKey as keyof (typeof role.permissions)[typeof groupKey]
    ],
  );
}

export function canManageMembers(role: Pick<ProjectRoleDefinition, "permissions">) {
  return (
    hasPermission(role, "members.invite") ||
    hasPermission(role, "members.remove") ||
    hasPermission(role, "members.changeRoles")
  );
}

export function canInviteMembers(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "members.invite");
}

export function canRemoveMembers(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "members.remove");
}

export function canChangeMemberRoles(
  role: Pick<ProjectRoleDefinition, "permissions">,
) {
  return hasPermission(role, "members.changeRoles");
}

export function canManageProjectSettings(
  role: Pick<ProjectRoleDefinition, "permissions">,
) {
  return hasPermission(role, "project.updateSettings");
}

export function canManageRoles(role: Pick<ProjectRoleDefinition, "permissions">) {
  return (
    hasPermission(role, "roles.create") ||
    hasPermission(role, "roles.update") ||
    hasPermission(role, "roles.delete")
  );
}

export function canCreateRoles(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "roles.create");
}

export function canUpdateRoles(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "roles.update");
}

export function canDeleteRoles(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "roles.delete");
}

export function canReadProject(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "project.read");
}

export function canReadWorkshop(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "workshop.read");
}

export function canReadBoard(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "board.read");
}

export function canUseAiPlanning(role: Pick<ProjectRoleDefinition, "permissions">) {
  return hasPermission(role, "workshop.generateWithAi");
}

export function canManageBoard(role: Pick<ProjectRoleDefinition, "permissions">) {
  return (
    hasPermission(role, "board.moveTasks") ||
    hasPermission(role, "board.manageColumns")
  );
}

export function countEnabledPermissions(permissions: RolePermissions) {
  return ROLE_PERMISSION_GROUPS.reduce(
    (total, group) =>
      total +
      group.permissions.filter(
        (permission) =>
          permissions[group.key]?.[
            permission.key as keyof (typeof permissions)[typeof group.key]
          ],
      ).length,
    0,
  );
}

export function countTotalPermissions() {
  return ROLE_PERMISSION_GROUPS.reduce(
    (total, group) => total + group.permissions.length,
    0,
  );
}

export function summarizePermissions(permissions: RolePermissions) {
  const enabledGroups = ROLE_PERMISSION_GROUPS.filter((group) =>
    group.permissions.some(
      (permission) =>
        permissions[group.key]?.[
          permission.key as keyof (typeof permissions)[typeof group.key]
        ],
    ),
  ).map((group) => group.label);

  if (enabledGroups.length === 0) {
    return "No enabled permissions";
  }

  if (enabledGroups.length === ROLE_PERMISSION_GROUPS.length) {
    return "All areas";
  }

  return enabledGroups.join(", ");
}
