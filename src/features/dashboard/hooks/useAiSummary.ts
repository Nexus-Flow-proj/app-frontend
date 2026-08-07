import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { dashboardService } from "../services";
import type { AiDashboardSummary } from "../types";

/**
 * Manual-trigger version: does NOT fetch on mount. The AI endpoint is
 * expensive to hit, so every user landing on the dashboard should not
 * auto-call it. `generate()` flips `enabled` to true, which fires the
 * query exactly once; the 5-minute staleTime then avoids re-hitting the
 * endpoint on every remount as long as the cache is still fresh.
 */
export function useAiSummary() {
  const [enabled, setEnabled] = useState(false);

  const query = useApiQuery<AiDashboardSummary>(
    QUERY_KEYS.dashboard.aiSummary(),
    () => dashboardService.getAiSummary(),
    { staleTime: 5 * 60_000, enabled },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    hasRequested: enabled,
    generate: () => setEnabled(true),
  };
}