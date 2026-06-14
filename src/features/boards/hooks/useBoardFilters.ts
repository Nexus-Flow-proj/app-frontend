// features/boards/hooks/useBoardFilters.ts
// Dev 4 — filter state lives in Zustand (UI state), never React Query.
// RULE: filtering = visual hide only. Never mutates sort_order arrays.

import { create } from "zustand";
import { useMemo } from "react";
import { isPast, isToday, endOfWeek, isBefore } from "date-fns";
import type { Task, BoardFiltersState, Priority } from "../types";

const DEFAULT_FILTERS: BoardFiltersState = {
  search: "",
  priorities: [],
  assigneeIds: [],
  dueDateRange: null,
  showOnlyMyTasks: false,
};

interface BoardFilterStore {
  filters: BoardFiltersState;
  setFilter: (patch: Partial<BoardFiltersState>) => void;
  resetFilters: () => void;
}

export const useBoardFilterStore = create<BoardFilterStore>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));

// ─── Filter predicate — pure function, safe to test in isolation ──────────────
function taskMatchesFilters(
  task: Task,
  filters: BoardFiltersState,
  currentUserId: string
): boolean {
  // Search
  if (
    filters.search &&
    !task.title.toLowerCase().includes(filters.search.toLowerCase())
  ) {
    return false;
  }

  // Priority
  if (
    filters.priorities.length > 0 &&
    !filters.priorities.includes(task.priority)
  ) {
    return false;
  }

  // Assignee
  if (
    filters.assigneeIds.length > 0 &&
    (!task.assignee || !filters.assigneeIds.includes(task.assignee.id))
  ) {
    return false;
  }

  // My tasks
  if (
    filters.showOnlyMyTasks &&
    task.assignee?.id !== currentUserId
  ) {
    return false;
  }

  // Due date range
  if (filters.dueDateRange && task.dueDate) {
    const due = new Date(task.dueDate);
    if (filters.dueDateRange === "overdue" && !(isPast(due) && !isToday(due)))
      return false;
    if (filters.dueDateRange === "today" && !isToday(due)) return false;
    if (
      filters.dueDateRange === "this_week" &&
      !isBefore(due, endOfWeek(new Date()))
    )
      return false;
  } else if (filters.dueDateRange && !task.dueDate) {
    // Has a due date filter but task has no due date — exclude
    return false;
  }

  return true;
}

// ─── Hook to get filtered task IDs for a column ───────────────────────────────
// Pass the ordered taskIds from Dev 1's BoardState — this never reorders them.
export function useFilteredTaskIds(
  taskIds: string[],
  tasks: Record<string, Task>,
  currentUserId: string
): string[] {
  const { filters } = useBoardFilterStore();

  return useMemo(
    () =>
      taskIds.filter((id) => {
        const task = tasks[id];
        return task ? taskMatchesFilters(task, filters, currentUserId) : false;
      }),
    [taskIds, tasks, filters, currentUserId]
  );
}

// ─── Active filter count (for the "Clear (n)" button) ─────────────────────────
export function useActiveFilterCount(): number {
  const { filters } = useBoardFilterStore();
  let n = 0;
  if (filters.search) n++;
  if (filters.priorities.length) n++;
  if (filters.assigneeIds.length) n++;
  if (filters.dueDateRange) n++;
  if (filters.showOnlyMyTasks) n++;
  return n;
}
