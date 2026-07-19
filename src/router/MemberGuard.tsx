import { Outlet } from "react-router";

export function MemberGuard() {
  // const { isAdmin, isMember } = useProjectStore();

  // // Both admins and members can access member routes
  // if (!isAdmin() && !isMember()) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <Outlet />;
}
