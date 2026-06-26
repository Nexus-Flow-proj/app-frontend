import { useAuthStore } from "@/store";
import { useMe } from "@/features/auth/hooks";
import Loading from "@/components/shared/loading/Loading";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { getCsrfToken } from "@/lib/api/csrf";

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  console.log(isAuthenticated);
  console.log(getCsrfToken());

  const setAuth = useAuthStore((s) => s.setAuth);
  const location = useLocation();
  const { data, isError, isFetching, isPending } = useMe(!isAuthenticated);
  console.log(data);

  useEffect(() => {
    if (!isAuthenticated && data?.user) {
      console.log("inside useEffect Auth", data.user);

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
