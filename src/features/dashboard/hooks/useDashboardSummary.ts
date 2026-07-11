import { useApiQuery } from "@/hooks/useApiQuery";
import { getDashboardSummary } from "../api/dashboard.api";
import type { DashboardSummary } from "../types";

export const DASHBOARD_SUMMARY_QUERY_KEY = ["dashboard-summary"];

export function useDashboardSummary() {
  const query = useApiQuery<DashboardSummary>(
    DASHBOARD_SUMMARY_QUERY_KEY,
    () => getDashboardSummary(),
    { staleTime: 60_000 },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,

  };
}