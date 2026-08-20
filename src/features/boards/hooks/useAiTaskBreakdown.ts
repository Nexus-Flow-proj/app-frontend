import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import type { ApiTaskBreakdown } from "../types/api/board-api.types";

export function useAiTaskBreakdown(projectId: string, taskId: string) {
  return useApiMutation<ApiTaskBreakdown, void>(
    () => taskService.getAiTaskBreakdown(projectId, taskId),
    {
      showSuccessToast: false,
    },
  );
}
