import { Outlet } from "react-router";

export function GuestGuard() {
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <Outlet />;
}
