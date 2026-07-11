import { useAuthStore } from "@/store";
import { useMe } from "@/features/auth/hooks";
import Loading from "@/components/shared/loading/Loading";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const location = useLocation();
  const { data, isError, isFetching, isPending } = useMe(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && data?.user) {
      setAuth(data.user);
    }
  }, [data?.user, isAuthenticated, setAuth]);

  if (isAuthenticated || data?.user) {
    return <Outlet />;
  }

  if (isPending || isFetching) {
    return <Loading fullPage text="Checking your session..." />;
  }

  if (isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Loading fullPage text="Checking your session..." />;
}
