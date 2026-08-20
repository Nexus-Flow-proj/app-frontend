import { ProjectPermissionGuard } from "./ProjectPermissionGuard";

export function MemberGuard() {
  return <ProjectPermissionGuard permissions={["project.read"]} />;
}
