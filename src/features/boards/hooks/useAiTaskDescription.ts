import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import type { ApiTaskDescriptionSuggestion } from "../types/api/board-api.types";

export function useAiTaskDescription(projectId: string, taskId: string) {
  return useApiMutation<ApiTaskDescriptionSuggestion, void>(
    () => taskService.getAiTaskDescription(projectId, taskId),
    {
      showSuccessToast: false,
    },
  );
}
