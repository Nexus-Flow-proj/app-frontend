import { Navigate, Outlet } from "react-router";
import { useProjectStore } from "@/store";

export function AdminGuard() {
  const isAdmin = useProjectStore((s) => s.isAdmin);

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
