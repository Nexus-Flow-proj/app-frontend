import { ProjectPermissionGuard } from "./ProjectPermissionGuard";

export function AdminGuard() {
  return <ProjectPermissionGuard permissions={["project.updateSettings"]} />;
}
