import { Outlet } from "react-router";

export function AdminGuard() {
  // const isAdmin = useProjectStore((s) => s.isAdmin);

  // if (!isAdmin()) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <Outlet />;
}
