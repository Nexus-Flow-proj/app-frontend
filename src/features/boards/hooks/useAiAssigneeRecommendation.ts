import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import type { ApiTaskAssigneeRecommendation } from "../types/api/board-api.types";

export function useAiAssigneeRecommendation(
    projectId: string,
    taskId: string,
) {
    return useApiMutation<ApiTaskAssigneeRecommendation, void>(
        () => taskService.getAiAssigneeRecommendation(projectId, taskId),
        {
            showSuccessToast: false,
        },
    );
}
