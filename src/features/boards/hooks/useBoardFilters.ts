import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { isPast, isToday, endOfWeek, isBefore } from "date-fns";
import { useFilterParams } from "@/hooks/useSearchParams";
import type { Task, BoardFiltersState } from "../types";
import type { TaskPriority } from "../types/enums";
import { BOARD_FILTER_PARAM_KEYS } from "../constants/boardBaramKeys";

const TODAY = new Date().toISOString().slice(0, 10);

// ─── Read filters from URL ────────────────────────────────────────────────────
export function useUrlFilters(): BoardFiltersState {
  const [params] = useSearchParams();
  return useMemo(
    () => ({
      search: params.get("search") ?? "",
      priorities: (params.get("priority")?.split(",").filter(Boolean) ??
        []) as TaskPriority[],
      assigneeIds: params.get("assignee")?.split(",").filter(Boolean) ?? [],
      dueDateRange:
        (params.get("due") as BoardFiltersState["dueDateRange"]) ?? null,
      showOnlyMyTasks: params.get("myTasks") === "true",
    }),
    [params],
  );
}

// ─── Write filters to URL ─────────────────────────────────────────────────────
export function useSetUrlFilters() {
  const { setParams } = useFilterParams();

  return useCallback(
    (patch: Partial<BoardFiltersState>) => {
      const nextParams: Record<string, string | null> = {};

      if (patch.search !== undefined) {
        nextParams.search = patch.search;
      }
      if (patch.priorities !== undefined) {
        nextParams.priority = patch.priorities.length
          ? patch.priorities.join(",")
          : null;
      }
      if (patch.assigneeIds !== undefined) {
        nextParams.assignee = patch.assigneeIds.length
          ? patch.assigneeIds.join(",")
          : null;
      }
      if (patch.dueDateRange !== undefined) {
        nextParams.due = patch.dueDateRange;
      }
      if (patch.showOnlyMyTasks !== undefined) {
        nextParams.myTasks = patch.showOnlyMyTasks ? "true" : null;
      }

      setParams(nextParams);
    },
    [setParams],
  );
}

// ─── Reset all filters ────────────────────────────────────────────────────────
export function useResetUrlFilters() {
  const { clearAll } = useFilterParams();
  return useCallback(() => clearAll(...BOARD_FILTER_PARAM_KEYS), [clearAll]);
}

// ─── Count active filters (for "Clear (n)" badge) ────────────────────────────
export function useActiveFilterCount(): number {
  const filters = useUrlFilters();
  let n = 0;
  if (filters.search) n++;
  if (filters.priorities.length) n++;
  if (filters.assigneeIds.length) n++;
  if (filters.dueDateRange) n++;
  if (filters.showOnlyMyTasks) n++;
  return n;
}

// ─── Pure filter predicate — safe to unit-test in isolation ──────────────────
export function taskMatchesFilters(
  task: Task,
  filters: BoardFiltersState,
  currentUserId: string,
): boolean {
  if (
    filters.search &&
    !task.title.toLowerCase().includes(filters.search.toLowerCase())
  )
    return false;

  if (filters.priorities.length && !filters.priorities.includes(task.priority))
    return false;

  if (
    filters.assigneeIds.length &&
    (!task.assignee || !filters.assigneeIds.includes(task.assignee.id))
  )
    return false;

  if (filters.showOnlyMyTasks && task.assignee?.id !== currentUserId)
    return false;

  if (filters.dueDateRange) {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (filters.dueDateRange === "overdue" && !(isPast(due) && !isToday(due)))
      return false;
    if (filters.dueDateRange === "today" && task.dueDate !== TODAY)
      return false;
    if (filters.dueDateRange === "this_week" && !isBefore(due, endOfWeek(now)))
      return false;
  }

  return true;
}

// ─── Filtered tasks for one column — preserves columnOrder order ─────────────
export function useFilteredTasks(tasks: Task[], currentUserId: string): Task[] {
  const filters = useUrlFilters();
  return useMemo(
    () =>
      tasks.filter((task) => taskMatchesFilters(task, filters, currentUserId)),
    [tasks, filters, currentUserId],
  );
}
