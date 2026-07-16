import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { dashboardService } from "../services";
import { useDashboardUiStore } from "../../../store/dashboardUiStore";
import type { TaskProgressData } from "../types";

export function useTaskProgress() {
  const range = useDashboardUiStore((s) => s.taskProgressRange);

  const query = useApiQuery<TaskProgressData>(
    QUERY_KEYS.dashboard.taskProgress(range),
    () => dashboardService.getTaskProgress(range),
    { staleTime: 60_000 },
  );

  return {
    range,
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
