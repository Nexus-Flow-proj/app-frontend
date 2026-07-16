import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { dashboardService } from "../services";
import type { DashboardSummary } from "../types";

export const DASHBOARD_SUMMARY_QUERY_KEY = QUERY_KEYS.dashboard.summary();

export function useDashboardSummary() {
  const query = useApiQuery<DashboardSummary>(
    DASHBOARD_SUMMARY_QUERY_KEY,
    () => dashboardService.getSummary(),
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
