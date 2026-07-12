import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { dashboardService } from "../services";
import type { TodaysFocusData } from "../types";

export const TODAYS_FOCUS_QUERY_KEY = QUERY_KEYS.dashboard.todaysFocus();

export function useTodaysFocus() {
  const query = useApiQuery<TodaysFocusData>(
    TODAYS_FOCUS_QUERY_KEY,
    () => dashboardService.getTodaysFocus(),
    { staleTime: 30_000 },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
