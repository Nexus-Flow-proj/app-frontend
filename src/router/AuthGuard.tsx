import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Loading from "@/components/shared/loading/Loading";
import { useMe } from "@/features/auth/hooks";
import { setCsrfToken } from "@/lib/api/csrf";
import { markSessionActive } from "@/lib/api/session";
import { useAuthStore } from "@/store";

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const location = useLocation();
  const { data: session, isError, isFetching, isPending } = useMe(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && session?.user) {
      markSessionActive();
      setCsrfToken(session.csrfToken);
      setAuth(session.user);
    }
  }, [session?.user, session?.csrfToken, isAuthenticated, setAuth]);

  if (isAuthenticated || session?.user) {
    return <Outlet />;
  }

  if (isPending || isFetching) {
    return <Loading fullPage text="Checking your session..." />;
  }

  if (isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}
