import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { dashboardService } from "../services";
import { TODAYS_FOCUS_QUERY_KEY } from "./useTodaysFocus";
import { DASHBOARD_SUMMARY_QUERY_KEY } from "./useDashboardSummary";
import type { ApiResponse } from "@/types";
import type { FocusItem, TodaysFocusData } from "../types";

interface ToggleFocusItemVariables {
  taskId: string;
  completed: boolean;
}

interface ToggleFocusItemContext {
  previous?: ApiResponse<TodaysFocusData>;
}

export function useToggleFocusItem() {
  const queryClient = useQueryClient();

  return useApiMutation<
    FocusItem,
    ToggleFocusItemVariables,
    ToggleFocusItemContext
  >(
    ({ taskId, completed }) =>
      dashboardService.toggleFocusItem(taskId, completed),
    {
      // Toggling a checkbox happens often and is low-stakes - a success toast
      // on every click would be noisy, so this mutation stays silent.
      showSuccessToast: false,

      onMutate: async ({ taskId, completed }) => {
        await queryClient.cancelQueries({ queryKey: TODAYS_FOCUS_QUERY_KEY });
        const previous = queryClient.getQueryData<ApiResponse<TodaysFocusData>>(
          TODAYS_FOCUS_QUERY_KEY,
        );

        if (previous) {
          queryClient.setQueryData<ApiResponse<TodaysFocusData>>(
            TODAYS_FOCUS_QUERY_KEY,
            {
              ...previous,
              data: previous.data.map((item) =>
                item.taskId === taskId ? { ...item, completed } : item,
              ),
            },
          );
        }

        return { previous };
      },

      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(TODAYS_FOCUS_QUERY_KEY, context.previous);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: TODAYS_FOCUS_QUERY_KEY });
        // Toggling a focus item changes the "Completed" count shown in
        // StatsGrid (dashboard-summary owns that number), so it needs to be
        // refetched too - otherwise it silently goes stale until the user
        // manually hits refresh.
        queryClient.invalidateQueries({
          queryKey: DASHBOARD_SUMMARY_QUERY_KEY,
        });
      },
    },
  );
}
