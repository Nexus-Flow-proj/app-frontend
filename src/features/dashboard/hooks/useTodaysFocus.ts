import { useApiQuery } from "@/hooks/useApiQuery";
import { getTodaysFocus } from "../api/dashboard.api";
import type { TodaysFocusData } from "../types";

export const TODAYS_FOCUS_QUERY_KEY = ["todays-focus"];

export function useTodaysFocus() {
  const query = useApiQuery<TodaysFocusData>(
    TODAYS_FOCUS_QUERY_KEY,
    () => getTodaysFocus(),
    { staleTime: 30_000 },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}