import { create } from "zustand";
import type { TaskProgressRange } from "../features/dashboard/types";

export type DashboardDrawerType = "activity" | "projects" | "deadlines" | null;

interface DashboardUiState {
  taskProgressRange: TaskProgressRange;
  setTaskProgressRange: (range: TaskProgressRange) => void;

  activeDrawer: DashboardDrawerType;
  openDrawer: (drawer: Exclude<DashboardDrawerType, null>) => void;
  closeDrawer: () => void;
}

export const useDashboardUiStore = create<DashboardUiState>((set) => ({
  taskProgressRange: "last_7_days",
  setTaskProgressRange: (range) => set({ taskProgressRange: range }),

  activeDrawer: null,
  openDrawer: (drawer) => set({ activeDrawer: drawer }),
  closeDrawer: () => set({ activeDrawer: null }),
}));
