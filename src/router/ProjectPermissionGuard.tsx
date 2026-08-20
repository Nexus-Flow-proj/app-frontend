import { Navigate, Outlet, useParams } from "react-router";
import Loading from "@/components/shared/loading/Loading";
import { ROUTES } from "@/constants";
import { useProjectAccess } from "@/features/project/hooks";
import type { RolePermissionPath } from "@/features/project/utils/rolePermissions";

interface ProjectPermissionGuardProps {
  permissions?: RolePermissionPath[];
  mode?: "all" | "any";
}

export function ProjectPermissionGuard({
  permissions = ["project.read"],
  mode = "all",
}: ProjectPermissionGuardProps) {
  const { id } = useParams<{ id: string }>();
  const {
    isPending,
    isLoading,
    isFetching,
    isError,
    isProjectMember,
    canAll,
    canAny,
  } = useProjectAccess(id);

  if (!id) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (isPending || isLoading || isFetching) {
    return <Loading text="Checking project access..." />;
  }

  const hasRequiredAccess =
    permissions.length === 0 ||
    (mode === "all" ? canAll(permissions) : canAny(permissions));

  if (isError || !isProjectMember || !hasRequiredAccess) {
    return <Navigate to={ROUTES.PROJECT_OVERVIEW(id)} replace />;
  }

  return <Outlet />;
}
