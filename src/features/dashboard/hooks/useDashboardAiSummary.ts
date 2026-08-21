import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { dashboardService } from "../services";
import type { DashboardAiSummary } from "../types";

export const DASHBOARD_AI_SUMMARY_QUERY_KEY =
  QUERY_KEYS.dashboard.aiSummary();

export function useDashboardAiSummary() {
  const query = useApiQuery<DashboardAiSummary>(
    DASHBOARD_AI_SUMMARY_QUERY_KEY,
    () => dashboardService.getAiSummary(),
    { enabled: false, staleTime: 60_000 },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
