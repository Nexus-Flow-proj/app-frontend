import { create } from "zustand";
import type {
  BoardColumn,
  BoardMember,
  BoardState,
  ColumnId,
  Comment,
  Subtask,
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
  isSubmittingComment: boolean;
  activeTaskId: TaskId | null;
  activeTask: TaskDetail | null;
}

interface AddTaskInput {
  title?: string;
  description?: string;
  priority?: Task["priority"];
  assignee?: BoardMember | null;
  dueDate?: string | null;
  tags?: string[];
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

  addColumn: (name?: string, color?: string) => ColumnId;
  addTask: (columnId: ColumnId, input?: AddTaskInput) => Task | null;
  updateTask: (taskId: TaskId, patch: UpdateTaskDto) => void;
  updateTaskAssignee: (taskId: TaskId, assignee: BoardMember | null) => void;
  moveTaskToColumn: (taskId: TaskId, targetColumnId: ColumnId) => void;
  toggleSubtask: (subtaskId: string, completed: boolean) => void;
  addSubtask: (title: string) => void;
  deleteSubtask: (subtaskId: string) => void;
  addComment: (content: string, author: BoardMember) => void;
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
  isSubmittingComment: false,
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

function patchBoardTask(
  boardState: BoardState,
  taskId: TaskId,
  patch: Partial<Task>,
): BoardState {
  return {
    ...boardState,
    tasks: Object.fromEntries(
      Object.entries(boardState.tasks).map(([columnId, tasks]) => [
        columnId,
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, ...patch, updatedAt: new Date().toISOString() }
            : task,
        ),
      ]),
    ) as BoardState["tasks"],
  };
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
        isSubmittingComment: false,
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

  addColumn: (name = "Untitled column", color) => {
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
        color,
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

  addTask: (columnId, input = {}) => {
    const { boardState, projectId } = get();
    const column = boardState.columns[columnId];

    if (!column) return null;

    const id = crypto.randomUUID();
    const columnTasks = boardState.tasks[columnId] ?? [];
    const title = input.title?.trim() || "Untitled task";
    const task: Task = {
      id,
      projectId: projectId ?? column.projectId,
      createdBy: "current-user",
      title,
      description: input.description || undefined,
      status: TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      dueDate: input.dueDate ?? undefined,
      boardColumnId: columnId,
      columnOrder: getNextSortOrder(columnTasks, "columnOrder"),
      source: TaskSource.MANUAL,
      createdAt: new Date().toISOString(),
      assignee: input.assignee ?? null,
      subtasksCount: 0,
      completedsubtasksCount: 0,
      commentsCount: 0,
      attachmentsCount: 0,
      tags: input.tags ?? [],
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

    return task;
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

  updateTaskAssignee: (taskId, assignee) =>
    set((state) => ({
      boardState: patchBoardTask(state.boardState, taskId, { assignee }),
      drawer:
        state.drawer.activeTask?.id === taskId
          ? {
            ...state.drawer,
            activeTask: {
              ...state.drawer.activeTask,
              assignee,
              updatedAt: new Date().toISOString(),
            },
          }
          : state.drawer,
    })),

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

  toggleSubtask: (subtaskId, completed) =>
    set((state) => {
      const activeTask = state.drawer.activeTask;
      if (!activeTask) return {};

      const subtask = activeTask.subtasks.find((item) => item.id === subtaskId);
      if (!subtask || subtask.completed === completed) return {};

      const completedsubtasksCount = completed
        ? (activeTask.completedsubtasksCount ?? 0) + 1
        : Math.max((activeTask.completedsubtasksCount ?? 0) - 1, 0);
      const nextActiveTask: TaskDetail = {
        ...activeTask,
        completedsubtasksCount,
        subtasks: activeTask.subtasks.map((item) =>
          item.id === subtaskId ? { ...item, completed } : item,
        ),
      };

      return {
        boardState: patchBoardTask(state.boardState, activeTask.id, {
          completedsubtasksCount,
        }),
        drawer: {
          ...state.drawer,
          activeTask: nextActiveTask,
        },
      };
    }),

  addSubtask: (title) =>
    set((state) => {
      const activeTask = state.drawer.activeTask;
      const trimmed = title.trim();
      if (!activeTask || !trimmed) return {};

      const now = new Date().toISOString();
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        taskId: activeTask.id,
        title: trimmed,
        completed: false,
        position: activeTask.subtasks.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      const subtasksCount = (activeTask.subtasksCount ?? 0) + 1;

      return {
        boardState: patchBoardTask(state.boardState, activeTask.id, {
          subtasksCount,
        }),
        drawer: {
          ...state.drawer,
          activeTask: {
            ...activeTask,
            subtasksCount,
            subtasks: [...activeTask.subtasks, newSubtask],
          },
        },
      };
    }),

  deleteSubtask: (subtaskId) =>
    set((state) => {
      const activeTask = state.drawer.activeTask;
      if (!activeTask) return {};

      const deletedSubtask = activeTask.subtasks.find(
        (item) => item.id === subtaskId,
      );
      if (!deletedSubtask) return {};

      const subtasksCount = Math.max((activeTask.subtasksCount ?? 0) - 1, 0);
      const completedsubtasksCount = deletedSubtask.completed
        ? Math.max((activeTask.completedsubtasksCount ?? 0) - 1, 0)
        : activeTask.completedsubtasksCount;

      return {
        boardState: patchBoardTask(state.boardState, activeTask.id, {
          subtasksCount,
          completedsubtasksCount,
        }),
        drawer: {
          ...state.drawer,
          activeTask: {
            ...activeTask,
            subtasksCount,
            completedsubtasksCount,
            subtasks: activeTask.subtasks.filter(
              (item) => item.id !== subtaskId,
            ),
          },
        },
      };
    }),

  addComment: (content, author) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    set((state) => {
      const activeTask = state.drawer.activeTask;
      if (!activeTask) return {};

      const now = new Date().toISOString();
      const newComment: Comment = {
        id: crypto.randomUUID(),
        taskId: activeTask.id,
        authorId: author.id,
        author,
        content: trimmed,
        createdAt: now,
        updatedAt: now,
      };
      const commentsCount = (activeTask.commentsCount ?? 0) + 1;

      return {
        boardState: patchBoardTask(state.boardState, activeTask.id, {
          commentsCount,
        }),
        drawer: {
          ...state.drawer,
          isSubmittingComment: true,
          activeTask: {
            ...activeTask,
            commentsCount,
            comments: [...activeTask.comments, newComment],
          },
        },
      };
    });

    window.setTimeout(() => {
      set((state) => ({
        drawer: {
          ...state.drawer,
          isSubmittingComment: false,
        },
      }));
    }, 300);
  },

  reset: () =>
    set({
      projectId: null,
      boardState: emptyBoardState,
      isBoardLoading: false,
      boardError: null,
      drawer: initialDrawerState,
    }),
}));
