import { Navigate, Outlet, useParams } from "react-router";
import Loading from "@/components/shared/loading/Loading";
import { ROUTES } from "@/constants";
import { useProjectMembers } from "@/features/project/hooks";
import {
  findProjectMemberForUser,
  isProjectOwner,
} from "@/features/project/utils/roles";
import { useAuthStore } from "@/store";

export function AdminGuard() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const {
    data: members = [],
    isLoading,
    isFetching,
    isError,
  } = useProjectMembers(id);

  if (!id) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (!user || isLoading || isFetching) {
    return <Loading text="Checking project access..." />;
  }

  const currentMember = findProjectMemberForUser(members, user);

  if (isError || !isProjectOwner(currentMember)) {
    return <Navigate to={ROUTES.PROJECT_OVERVIEW(id)} replace />;
  }

  return <Outlet />;
}
