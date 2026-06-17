import { Outlet } from "react-router";

export function AuthGuard() {
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  return <Outlet />;
}
