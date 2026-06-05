import { Navigate, Outlet } from "react-router";
import { useProjectStore } from "@/store";

export function MemberGuard() {
  // const { isAdmin, isMember } = useProjectStore();

  // // Both admins and members can access member routes
  // if (!isAdmin() && !isMember()) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <Outlet />;
}
