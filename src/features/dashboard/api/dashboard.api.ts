
import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  DashboardSummary,
  FocusItem,
  TaskProgressData,
  TaskProgressRange,
  TodaysFocusData,
} from "../types";

/**
 * ---------------------------------------------------------------------------
 * Dashboard API layer - 3 independent endpoints
 * ---------------------------------------------------------------------------
 * Wired to the real backend. Same query keys/hooks as before still apply -
 * only the function bodies changed from mock to real requests.
 * ---------------------------------------------------------------------------
 */

/**
 * GET /dashboard/summary
 */
export const getDashboardSummary = (): Promise<ApiResponse<DashboardSummary>> =>
  api
    .get<ApiResponse<DashboardSummary>>("/dashboard/summary")
    .then((r) => r.data);

/**
 * GET /dashboard/task-progress?range=...
 */
export const getTaskProgress = (
  range: TaskProgressRange,
): Promise<ApiResponse<TaskProgressData>> =>
  api
    .get<ApiResponse<TaskProgressData>>("/dashboard/task-progress", {
      params: { range },
    })
    .then((r) => r.data);

/**
 * GET /dashboard/todays-focus
 */
export const getTodaysFocus = (): Promise<ApiResponse<TodaysFocusData>> =>
  api
    .get<ApiResponse<TodaysFocusData>>("/dashboard/todays-focus")
    .then((r) => r.data);

/**
 * PATCH /dashboard/todays-focus/:taskId
 */
export const toggleFocusItem = (
  taskId: string,
  completed: boolean,
): Promise<ApiResponse<FocusItem>> =>
  api
    .patch<ApiResponse<FocusItem>>(`/dashboard/todays-focus/${taskId}`, {
      completed,
    })
    .then((r) => r.data);