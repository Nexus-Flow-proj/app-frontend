import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  DashboardSummary,
  FocusItem,
  TaskProgressData,
  TaskProgressRange,
  TodaysFocusData,
} from "../types";

export const dashboardService = {
  getSummary: (): Promise<ApiResponse<DashboardSummary>> =>
    api
      .get<ApiResponse<DashboardSummary>>("/dashboard/summary")
      .then((response) => response.data),

  getTaskProgress: (
    range: TaskProgressRange,
  ): Promise<ApiResponse<TaskProgressData>> =>
    api
      .get<ApiResponse<TaskProgressData>>("/dashboard/task-progress", {
        params: { range },
      })
      .then((response) => response.data),

  getTodaysFocus: (): Promise<ApiResponse<TodaysFocusData>> =>
    api
      .get<ApiResponse<TodaysFocusData>>("/dashboard/todays-focus")
      .then((response) => response.data),

  toggleFocusItem: (
    taskId: string,
    completed: boolean,
  ): Promise<ApiResponse<FocusItem>> =>
    api
      .patch<ApiResponse<FocusItem>>(`/dashboard/todays-focus/${taskId}`, {
        completed,
      })
      .then((response) => response.data),
};
