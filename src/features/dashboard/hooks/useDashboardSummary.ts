
import { useApiQuery } from "@/hooks/useApiQuery";
import { getDashboardSummary } from "../api/dashboard.api";
import type { DashboardSummary } from "../types";

export function useDashboardSummary() {
  const query = useApiQuery<DashboardSummary>(
    ["dashboard-summary"],
    () => getDashboardSummary(),
    { staleTime: 60_000 },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}