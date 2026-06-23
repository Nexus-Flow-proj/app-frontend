import { create } from "zustand";
import type {
  BoardColumn,
  BoardState,
  ColumnId,
  Task,
  TaskDetail,
  TaskId,
  UpdateTaskDto,
} from "@/features/boards/types";
import {
  TaskPriority,
  TaskSource,
  TaskStatus,
} from "@/features/boards/types/enums";

type BoardStateUpdater = BoardState | ((current: BoardState) => BoardState);

interface KanbanDrawerState {
  isOpen: boolean;
  isLoading: boolean;
  activeTaskId: TaskId | null;
  activeTask: TaskDetail | null;
}

interface KanbanStoreState {
  projectId: string | null;
  boardState: BoardState;
  isBoardLoading: boolean;
  boardError: string | null;
  drawer: KanbanDrawerState;

  initializeBoard: (boardState: BoardState, projectId?: string | null) => void;
  setBoardState: (updater: BoardStateUpdater) => void;
  setBoardLoading: (isLoading: boolean) => void;
  setBoardError: (error: string | null) => void;

  openTaskDrawer: (task: Task) => void;
  setDrawerTask: (task: TaskDetail | null) => void;
  setDrawerLoading: (isLoading: boolean) => void;
  closeTaskDrawer: () => void;

  addColumn: (name?: string) => ColumnId;
  addTask: (columnId: ColumnId, title?: string) => TaskId | null;
  updateTask: (taskId: TaskId, patch: UpdateTaskDto) => void;
  moveTaskToColumn: (taskId: TaskId, targetColumnId: ColumnId) => void;
  reset: () => void;
}

const emptyBoardState: BoardState = {
  columns: {},
  tasks: {},
  columnOrder: [],
};

const initialDrawerState: KanbanDrawerState = {
  isOpen: false,
  isLoading: false,
  activeTaskId: null,
  activeTask: null,
};

function getNextSortOrder<T extends { sortOrder?: number; columnOrder?: number }>(
  items: T[],
  key: "sortOrder" | "columnOrder",
) {
  const maxOrder = items.reduce((max, item) => {
    const order = item[key] ?? 0;
    return order > max ? order : max;
  }, 0);

  return maxOrder + 1;
}

function createTaskDetail(task: Task): TaskDetail {
  return {
    ...task,
    subtasks: [],
    comments: [],
    activityLog: [],
  };
}

function applyTaskPatch<T extends Task>(task: T, patch: UpdateTaskDto): T {
  const nextTask = { ...task };

  if (patch.title !== undefined) nextTask.title = patch.title;
  if (patch.description !== undefined) nextTask.description = patch.description;
  if (patch.priority !== undefined) nextTask.priority = patch.priority;
  if (patch.dueDate !== undefined) {
    nextTask.dueDate = patch.dueDate ?? undefined;
  }

  nextTask.updatedAt = new Date().toISOString();
  return nextTask;
}

export const useKanbanStore = create<KanbanStoreState>()((set, get) => ({
  projectId: null,
  boardState: emptyBoardState,
  isBoardLoading: false,
  boardError: null,
  drawer: initialDrawerState,

  initializeBoard: (boardState, projectId = null) =>
    set({
      projectId,
      boardState,
      isBoardLoading: false,
      boardError: null,
      drawer: initialDrawerState,
    }),

  setBoardState: (updater) =>
    set((state) => ({
      boardState:
        typeof updater === "function" ? updater(state.boardState) : updater,
    })),

  setBoardLoading: (isBoardLoading) => set({ isBoardLoading }),
  setBoardError: (boardError) => set({ boardError }),

  openTaskDrawer: (task) =>
    set({
      drawer: {
        isOpen: true,
        isLoading: true,
        activeTaskId: task.id,
        activeTask: createTaskDetail(task),
      },
    }),

  setDrawerTask: (task) =>
    set((state) => ({
      drawer: {
        ...state.drawer,
        activeTaskId: task?.id ?? state.drawer.activeTaskId,
        activeTask: task,
      },
    })),

  setDrawerLoading: (isLoading) =>
    set((state) => ({
      drawer: {
        ...state.drawer,
        isLoading,
      },
    })),

  closeTaskDrawer: () => set({ drawer: initialDrawerState }),

  addColumn: (name = "Untitled column") => {
    const id = crypto.randomUUID();

    set((state) => {
      const orderedColumns = state.boardState.columnOrder
        .map((columnId) => state.boardState.columns[columnId])
        .filter(Boolean);
      const projectId = state.projectId ?? "local-project";
      const column: BoardColumn = {
        id,
        projectId,
        name,
        sortOrder: getNextSortOrder(orderedColumns, "sortOrder"),
        isProtected: false,
        createdAt: new Date().toISOString(),
      };

      return {
        boardState: {
          ...state.boardState,
          columns: {
            ...state.boardState.columns,
            [id]: column,
          },
          tasks: {
            ...state.boardState.tasks,
            [id]: [],
          },
          columnOrder: [...state.boardState.columnOrder, id],
        },
      };
    });

    return id;
  },

  addTask: (columnId, title = "Untitled task") => {
    const { boardState, projectId } = get();
    const column = boardState.columns[columnId];

    if (!column) return null;

    const id = crypto.randomUUID();
    const columnTasks = boardState.tasks[columnId] ?? [];
    const task: Task = {
      id,
      projectId: projectId ?? column.projectId,
      createdBy: "current-user",
      title,
      description: "",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      boardColumnId: columnId,
      columnOrder: getNextSortOrder(columnTasks, "columnOrder"),
      source: TaskSource.MANUAL,
      createdAt: new Date().toISOString(),
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      attachmentCount: 0,
      tags: [],
    };

    set((state) => ({
      boardState: {
        ...state.boardState,
        tasks: {
          ...state.boardState.tasks,
          [columnId]: [...(state.boardState.tasks[columnId] ?? []), task],
        },
      },
    }));

    return id;
  },

  updateTask: (taskId, patch) =>
    set((state) => {
      const nextTasks = Object.fromEntries(
        Object.entries(state.boardState.tasks).map(([columnId, tasks]) => [
          columnId,
          tasks.map((task) =>
            task.id === taskId ? applyTaskPatch(task, patch) : task,
          ),
        ]),
      ) as BoardState["tasks"];

      return {
        boardState: {
          ...state.boardState,
          tasks: nextTasks,
        },
        drawer:
          state.drawer.activeTask?.id === taskId
            ? {
                ...state.drawer,
                activeTask: applyTaskPatch(state.drawer.activeTask, patch),
              }
            : state.drawer,
      };
    }),

  moveTaskToColumn: (taskId, targetColumnId) =>
    set((state) => {
      const targetColumn = state.boardState.columns[targetColumnId];
      const sourceColumnId = Object.entries(state.boardState.tasks).find(
        ([, tasks]) => tasks.some((task) => task.id === taskId),
      )?.[0];

      if (!sourceColumnId || !targetColumn || sourceColumnId === targetColumnId) {
        return {};
      }

      const sourceTasks = state.boardState.tasks[sourceColumnId] ?? [];
      const targetTasks = state.boardState.tasks[targetColumnId] ?? [];
      const movingTask = sourceTasks.find((task) => task.id === taskId);

      if (!movingTask) return {};

      const movedTask: Task = {
        ...movingTask,
        boardColumnId: targetColumnId,
        columnOrder: getNextSortOrder(targetTasks, "columnOrder"),
        updatedAt: new Date().toISOString(),
      };

      return {
        boardState: {
          ...state.boardState,
          tasks: {
            ...state.boardState.tasks,
            [sourceColumnId]: sourceTasks.filter((task) => task.id !== taskId),
            [targetColumnId]: [...targetTasks, movedTask],
          },
        },
        drawer:
          state.drawer.activeTask?.id === taskId
            ? {
                ...state.drawer,
                activeTask: {
                  ...state.drawer.activeTask,
                  boardColumnId: movedTask.boardColumnId,
                  columnOrder: movedTask.columnOrder,
                  updatedAt: movedTask.updatedAt,
                },
              }
            : state.drawer,
      };
    }),

  reset: () =>
    set({
      projectId: null,
      boardState: emptyBoardState,
      isBoardLoading: false,
      boardError: null,
      drawer: initialDrawerState,
    }),
}));
