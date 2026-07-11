import { ProjectPermissionGuard } from "./ProjectPermissionGuard";

export function RoleManagementGuard() {
  return (
    <ProjectPermissionGuard
      permissions={["roles.create", "roles.update", "roles.delete"]}
      mode="any"
    />
  );
}
