// features/boards/hooks/useBoardFilters.ts
// Dev 4 — filter state synced between Zustand (UI) and URL (useSearchParams).
// RULE: filters only HIDE cards visually — never mutate columnOrder arrays.

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { isPast, isToday, endOfWeek, isBefore } from "date-fns";
import type { Task, BoardFiltersState } from "../types";
import type { TaskPriority } from "../types/enums";

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
  const [, setParams] = useSearchParams();

  return useCallback(
    (patch: Partial<BoardFiltersState>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (patch.search !== undefined) {
            if (patch.search) next.set("search", patch.search);
            else next.delete("search");
          }
          if (patch.priorities !== undefined) {
            if (patch.priorities.length) {
              next.set("priority", patch.priorities.join(","));
            } else {
              next.delete("priority");
            }
          }
          if (patch.assigneeIds !== undefined) {
            if (patch.assigneeIds.length) {
              next.set("assignee", patch.assigneeIds.join(","));
            } else {
              next.delete("assignee");
            }
          }
          if (patch.dueDateRange !== undefined) {
            if (patch.dueDateRange) next.set("due", patch.dueDateRange);
            else next.delete("due");
          }
          if (patch.showOnlyMyTasks !== undefined) {
            if (patch.showOnlyMyTasks) next.set("myTasks", "true");
            else next.delete("myTasks");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );
}

// ─── Reset all filters ────────────────────────────────────────────────────────
export function useResetUrlFilters() {
  const [, setParams] = useSearchParams();
  return useCallback(() => setParams({}, { replace: true }), [setParams]);
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
export function useFilteredTasks(
  tasks: Task[],
  currentUserId: string,
): Task[] {
  const filters = useUrlFilters();
  return useMemo(
    () =>
      tasks.filter((task) =>
        taskMatchesFilters(task, filters, currentUserId),
      ),
    [tasks, filters, currentUserId],
  );
}
