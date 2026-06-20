import { useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  BoardState,
  Task,
  TaskDetail,
  Priority,
  Subtask,
  Comment,
  BoardMember,
  ActivityEvent,
} from "../types";

// ─── tiny id helper (no extra deps) ─────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── params ──────────────────────────────────────────────────────────────────
interface UseTaskDatailParams {
  boardState: BoardState;
  setBoardState: Dispatch<SetStateAction<BoardState>>;
  currentUser: BoardMember;
  /** Optional: async fetch for full task detail (subtasks, comments, …).
   *  If omitted the hook falls back to whatever is already on the card + empty arrays. */
  fetchTaskDetail?: (taskId: string) => Promise<TaskDetail>;
}

// ─── hook ────────────────────────────────────────────────────────────────────
export function useTaskDatail({
  boardState,
  setBoardState,
  currentUser,
  fetchTaskDetail,
}: UseTaskDatailParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);


  /** Patch a task card inside boardState.tasks (optimistic). */
  function patchTaskCard(taskId: string, patch: Partial<Task>) {
    setBoardState((prev) => {
      const nextTasks = { ...prev.tasks };
      for (const colId of Object.keys(nextTasks)) {
        const idx = nextTasks[colId].findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          nextTasks[colId] = nextTasks[colId].map((t) =>
            t.id === taskId ? { ...t, ...patch } : t
          );
          break;
        }
      }
      return { ...prev, tasks: nextTasks };
    });
  }

  /** Move a task card to a different column inside boardState.tasks. */
  function moveTaskCard(taskId: string, targetColumnId: string) {
    setBoardState((prev) => {
      let movedTask: Task | undefined;
      const nextTasks: BoardState["tasks"] = {};

      for (const colId of Object.keys(prev.tasks)) {
        const col = prev.tasks[colId];
        if (col.some((t) => t.id === taskId)) {
          movedTask = col.find((t) => t.id === taskId);
          nextTasks[colId] = col.filter((t) => t.id !== taskId);
        } else {
          nextTasks[colId] = col;
        }
      }

      if (!movedTask) return prev;

      const updatedTask: Task = {
        ...movedTask,
        boardColumnId: targetColumnId,
      };

      nextTasks[targetColumnId] = [
        ...(nextTasks[targetColumnId] ?? []),
        updatedTask,
      ];

      return { ...prev, tasks: nextTasks };
    });
  }

  /** Add an activity event to the local detail state. */
  function addActivity(action: string): ActivityEvent {
    return {
      id: uid(),
      actor: currentUser,
      action,
      createdAt: new Date().toISOString(),
    };
  }

  // ── open / close ───────────────────────────────────────────────────────────

  const openDrawer = useCallback(
    async (task: Task) => {
      setIsOpen(true);
      setIsLoading(true);
      setTaskDetail(null);

      try {
        if (fetchTaskDetail) {
          const detail = await fetchTaskDetail(task.id);
          setTaskDetail(detail);
        } else {
          // fallback: build a TaskDetail from the card data
          setTaskDetail({
            ...task,
            subtasks: [],
            comments: [],
            activityLog: [],
            attachments: [],
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTaskDetail]
  );

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // keep taskDetail mounted briefly so the close animation plays smoothly
    setTimeout(() => setTaskDetail(null), 300);
  }, []);

  // ── priority ──────────────────────────────────────────────────────────────

  const handleUpdatePriority = useCallback(
    (taskId: string, priority: Priority) => {
      // 1. update the kanban card
      patchTaskCard(taskId, { priority });

      // 2. update the open drawer
      setTaskDetail((prev) =>
        prev?.id === taskId ? { ...prev, priority } : prev
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardState]
  );

  // ── assignee ──────────────────────────────────────────────────────────────

  const handleUpdateAssignee = useCallback(
    (taskId: string, assigneeId: string | null) => {
      // find BoardMember from boardState columns or keep null
      let assignee: BoardMember | null = null;
      if (assigneeId) {
        // we derive the member object from any task that already has it,
        // or fall back to an id-only placeholder — callers should pass the
        // real member list if they need the name shown immediately.
        for (const tasks of Object.values(boardState.tasks)) {
          const m = tasks
            .map((t) => t.assignee)
            .find((a) => a?.id === assigneeId);
          if (m) {
            assignee = m;
            break;
          }
        }
        assignee = assignee ?? { id: assigneeId, name: "" };
      }

      patchTaskCard(taskId, { assignee });
      setTaskDetail((prev) =>
        prev?.id === taskId ? { ...prev, assignee } : prev
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardState]
  );

  // ── due date ──────────────────────────────────────────────────────────────

  const handleUpdateDueDate = useCallback(
    (taskId: string, dueDate: string | null) => {
      patchTaskCard(taskId, { dueDate: dueDate ?? undefined });
      setTaskDetail((prev) =>
        prev?.id === taskId
          ? { ...prev, dueDate: dueDate ?? undefined }
          : prev
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardState]
  );

  // ── move to column ────────────────────────────────────────────────────────

  const handleMoveToColumn = useCallback(
    (taskId: string, columnId: string) => {
      moveTaskCard(taskId, columnId);
      setTaskDetail((prev) =>
        prev?.id === taskId ? { ...prev, boardColumnId: columnId } : prev
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boardState]
  );

  // ── subtasks ──────────────────────────────────────────────────────────────

  const handleToggleSubtask = useCallback(
    (subtaskId: string, completed: boolean) => {
      setTaskDetail((prev) => {
        if (!prev) return prev;
        const subtasks = prev.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed } : s
        );
        const completedCount = subtasks.filter((s) => s.completed).length;
        // mirror counts on the kanban card
        patchTaskCard(prev.id, {
          completedSubtaskCount: completedCount,
          subtaskCount: subtasks.length,
        });
        return { ...prev, subtasks };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleAddSubtask = useCallback((title: string) => {
    setTaskDetail((prev) => {
      if (!prev) return prev;
      const newSubtask: Subtask = {
        id: uid(),
        taskId: prev.id,
        title,
        completed: false,
        position: prev.subtasks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const subtasks = [...prev.subtasks, newSubtask];
      patchTaskCard(prev.id, { subtaskCount: subtasks.length });
      return {
        ...prev,
        subtasks,
        activityLog: [addActivity(`added subtask "${title}"`), ...prev.activityLog],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteSubtask = useCallback((subtaskId: string) => {
    setTaskDetail((prev) => {
      if (!prev) return prev;
      const subtasks = prev.subtasks.filter((s) => s.id !== subtaskId);
      patchTaskCard(prev.id, {
        subtaskCount: subtasks.length,
        completedSubtaskCount: subtasks.filter((s) => s.completed).length,
      });
      return { ...prev, subtasks };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── comments ──────────────────────────────────────────────────────────────

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!taskDetail) return;
      setIsSubmittingComment(true);

      // optimistic
      const optimistic: Comment = {
        id: `optimistic-${uid()}`,
        taskId: taskDetail.id,
        author: currentUser,
        content,
        createdAt: new Date().toISOString(),
      };

      setTaskDetail((prev) => {
        if (!prev) return prev;
        const comments = [...prev.comments, optimistic];
        patchTaskCard(prev.id, { commentCount: comments.length });
        return {
          ...prev,
          comments,
          activityLog: [addActivity("added a comment"), ...prev.activityLog],
        };
      });

      try {
        // TODO: replace with real API call, e.g.:
        // const saved = await api.comments.create({ taskId: taskDetail.id, content });
        // swap optimistic comment with real one
        await new Promise((r) => setTimeout(r, 400)); // simulate network
        setTaskDetail((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === optimistic.id ? { ...c, id: uid() } : c
            ),
          };
        });
      } catch {
        // rollback on failure
        setTaskDetail((prev) => {
          if (!prev) return prev;
          const comments = prev.comments.filter((c) => c.id !== optimistic.id);
          patchTaskCard(prev.id, { commentCount: comments.length });
          return { ...prev, comments };
        });
      } finally {
        setIsSubmittingComment(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taskDetail, currentUser]
  );

  // ── return value ──────────────────────────────────────────────────────────
  return {
    /** Call this when a kanban card is clicked. */
    openDrawer,

    /** Spread these directly onto <TaskDetailDrawer … /> */
    drawerProps: {
      task: taskDetail,
      isOpen,
      isLoading,
      isSubmittingComment,
      onClose: closeDrawer,
      onUpdatePriority: handleUpdatePriority,
      onUpdateAssignee: handleUpdateAssignee,
      onUpdateDueDate: handleUpdateDueDate,
      onMoveToColumn: handleMoveToColumn,
      onToggleSubtask: handleToggleSubtask,
      onAddSubtask: handleAddSubtask,
      onDeleteSubtask: handleDeleteSubtask,
      onAddComment: handleAddComment,
    },
  };
}