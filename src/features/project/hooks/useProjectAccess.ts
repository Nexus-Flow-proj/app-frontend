import { useEffect } from "react";
import { useProjectStore } from "@/store";
import { hasPermission, type RolePermissionPath } from "../utils/rolePermissions";
import { useProject } from "./useProject";

export function useProjectAccess(projectId?: string) {
  const projectQuery = useProject(projectId);
  const setProjectAccess = useProjectStore((state) => state.setProjectAccess);

  useEffect(() => {
    if (!projectId || projectQuery.isError) {
      setProjectAccess(null);
      return;
    }

    if (projectQuery.data) {
      setProjectAccess(projectQuery.data);
    }
  }, [projectId, projectQuery.data, projectQuery.isError, setProjectAccess]);

  const currentMember = projectQuery.data?.currentMember ?? null;
  const role = currentMember?.role ?? null;

  function can(permissionPath: RolePermissionPath) {
    return role ? hasPermission(role, permissionPath) : false;
  }

  function canAny(permissionPaths: RolePermissionPath[]) {
    return permissionPaths.some((permissionPath) => can(permissionPath));
  }

  function canAll(permissionPaths: RolePermissionPath[]) {
    return permissionPaths.every((permissionPath) => can(permissionPath));
  }

  return {
    ...projectQuery,
    project: projectQuery.data ?? null,
    currentMember,
    role,
    permissions: role?.permissions ?? null,
    isProjectMember: !!currentMember,
    can,
    canAny,
    canAll,
  };
}
