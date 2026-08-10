import { useAuthStore } from "@/store";
import { useMe } from "@/features/auth/hooks";
import Loading from "@/components/shared/loading/Loading";
import { setCsrfToken } from "@/lib/api/csrf";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

export function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { data: session, isFetching, isPending } = useMe(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && session?.user) {
      setCsrfToken(session.csrfToken);
      setAuth(session.user);
    }
  }, [session?.user, session?.csrfToken, isAuthenticated, setAuth]);

  if (isAuthenticated || session?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isPending || isFetching) {
    return <Loading fullPage text="Checking your session..." />;
  }

  return <Outlet />;
}
