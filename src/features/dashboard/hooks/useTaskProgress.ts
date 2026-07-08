import { useApiQuery } from "@/hooks/useApiQuery";
import { getTaskProgress } from "../api/dashboard.api";
import { useDashboardUiStore } from "../store/dashboardUiStore";
import type { TaskProgressData } from "../types";

export function useTaskProgress() {
  const range = useDashboardUiStore((s) => s.taskProgressRange);

  const query = useApiQuery<TaskProgressData>(
    ["task-progress", range],
    () => getTaskProgress(range),
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