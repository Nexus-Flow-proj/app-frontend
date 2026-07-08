
import type { ApiResponse } from "@/types";
import type {
  DashboardData,
  DashboardSummary,
  FocusItem,
  TaskProgressData,
  TaskProgressPoint,
  TaskProgressRange,
  TodaysFocusData,
} from "../types";
import { MOCK_DASHBOARD_DATA } from "../mock/dashboard.mock";

/**
 * ---------------------------------------------------------------------------
 * Dashboard API layer - 3 independent endpoints
 * ---------------------------------------------------------------------------
 * 1. getDashboardSummary()        -> stats, deadlines, activity, projects
 * 2. getTaskProgress(range)       -> chart data only, keyed by range
 * 3. getTodaysFocus() / toggle    -> focus list only
 *
 * Each is backed by the same in-memory mock store for now, but each has its
 * own query key on the frontend (see the hooks), so refetching one never
 * forces the others to reload. When the real backend is ready, swap the body
 * of each function for the real request (examples commented below) - nothing
 * else changes.
 * ---------------------------------------------------------------------------
 */

const MOCK_DELAY_MS = 500;

function mockResponse<T>(
  data: T,
  message = "Success",
): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message, data } as ApiResponse<T>);
    }, MOCK_DELAY_MS);
  });
}

// Single in-memory source backing all three endpoints below - simulates a
// shared DB so toggling a focus item is visible if you refetch the summary
// too, even though they're separate requests.
let dashboardStore: DashboardData = structuredClone(MOCK_DASHBOARD_DATA);

const RANGE_POINTS: Record<TaskProgressRange, TaskProgressPoint[]> = {
  last_7_days: MOCK_DASHBOARD_DATA.taskProgress.points,
  last_30_days: [
    { day: "Week 1", completed: 42 },
    { day: "Week 2", completed: 58 },
    { day: "Week 3", completed: 51 },
    { day: "Week 4", completed: 63 },
  ],
  this_month: [
    { day: "Week 1", completed: 30 },
    { day: "Week 2", completed: 45 },
    { day: "Week 3", completed: 39 },
    { day: "Week 4", completed: 27 },
  ],
};

/**
 * GET /dashboard/summary
 */
export async function getDashboardSummary(): Promise<
  ApiResponse<DashboardSummary>
> {
  // Real implementation later:
  // const res = await apiClient.get<DashboardSummary>("/dashboard/summary");
  // return res.data;

  const { stats, upcomingDeadlines, recentActivity, recentProjects } =
    dashboardStore;

  return mockResponse({
    stats,
    upcomingDeadlines,
    recentActivity,
    recentProjects,
  });
}

/**
 * GET /dashboard/task-progress?range=...
 */
export async function getTaskProgress(
  range: TaskProgressRange,
): Promise<ApiResponse<TaskProgressData>> {
  // Real implementation later:
  // const res = await apiClient.get<TaskProgressData>("/dashboard/task-progress", { params: { range } });
  // return res.data;

  return mockResponse({ range, points: RANGE_POINTS[range] });
}

/**
 * GET /dashboard/todays-focus
 */
export async function getTodaysFocus(): Promise<
  ApiResponse<TodaysFocusData>
> {
  // Real implementation later:
  // const res = await apiClient.get<TodaysFocusData>("/dashboard/todays-focus");
  // return res.data;

  return mockResponse(dashboardStore.todaysFocus);
}

/**
 * PATCH /dashboard/todays-focus/:taskId
 */
export async function toggleFocusItem(
  taskId: string,
  completed: boolean,
): Promise<ApiResponse<FocusItem>> {
  // Real implementation later:
  // const res = await apiClient.patch<FocusItem>(`/dashboard/todays-focus/${taskId}`, { completed });
  // return res.data;

  dashboardStore = {
    ...dashboardStore,
    todaysFocus: dashboardStore.todaysFocus.map((item) =>
      item.taskId === taskId ? { ...item, completed } : item,
    ),
  };

  const updated = dashboardStore.todaysFocus.find(
    (item) => item.taskId === taskId,
  );

  if (!updated) {
    throw new Error(`Focus item with taskId "${taskId}" was not found`);
  }

  return mockResponse(updated, "Task updated");
}