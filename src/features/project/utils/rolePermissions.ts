import { ROLE_PERMISSION_GROUPS } from "../constants/rolePresets";
import type { RolePermissions } from "../types/roles";

export function countEnabledPermissions(permissions: RolePermissions) {
  return ROLE_PERMISSION_GROUPS.reduce(
    (total, group) =>
      total +
      group.permissions.filter(
        (permission) =>
          permissions[group.key][
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
        permissions[group.key][
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
