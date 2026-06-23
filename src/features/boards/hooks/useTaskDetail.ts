// features/boards/hooks/useTaskDetail.ts
//
// ─── HOW THIS WORKS ───────────────────────────────────────────────────────────
// دلوقتي: كل حاجة بتشتغل بـ mock data محلي.
// لما الـ API يجهز: دوّر على كل سطر فيه "TODO: REPLACE WITH API"
// واستبدله بالـ mutation / query المناظر.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { Priority, Task, TaskDetail, BoardState } from "../types";
import { MOCK_TASK_DETAIL, MOCK_MEMBERS, CURRENT_USER } from "../data/mock-data";

interface UseTaskDetailParams {
  projectId: string;
  setBoardState: Dispatch<SetStateAction<BoardState>>;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function patchTask(prev: BoardState, taskId: string, patch: Partial<Task>): BoardState {
  return {
    ...prev,
    tasks: Object.fromEntries(
      Object.entries(prev.tasks).map(([colId, tasks]) => [
        colId,
        tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      ]),
    ),
  };
}

/** بيجيب الـ task من الـ boardState */
function findTask(state: BoardState, taskId: string): Task | undefined {
  return Object.values(state.tasks).flat().find((t) => t.id === taskId);
}

// ─────────────────────────────────────────────────────────────────────────────

export function useTaskDetail({ projectId: _projectId, setBoardState }: UseTaskDetailParams) {
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isOpen = openTaskId !== null;


  const openDrawer = useCallback((task: Task) => {
    setOpenTaskId(task.id);

    // TODO: REPLACE WITH API → useTaskDetailQuery(task.id)
    // دلوقتي بنجيب من الـ mock أو نبني من الـ task اللي عندنا
    const existing = MOCK_TASK_DETAIL[task.id];
    setTaskDetail(
      existing ?? {
        ...task,
        subtasks: [],
        comments: [],
        activityLog: [],
      },
    );
  }, []);

  const closeDrawer = useCallback(() => {
    setOpenTaskId(null);
    setTaskDetail(null);
  }, []);


  const patchDetail = useCallback((patch: Partial<TaskDetail>) => {
    setTaskDetail((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);


  const handleUpdatePriority = useCallback(
    (taskId: string, priority: Priority) => {

      setBoardState((prev) => patchTask(prev, taskId, { priority }));
      patchDetail({ priority });

      // TODO: REPLACE WITH API → updateTask.mutate({ taskId, dto: { priority } })
      console.log("[mock] updatePriority", { taskId, priority });
    },
    [setBoardState, patchDetail],
  );

  // ── assignee ──────────────────────────────────────────────────────────────

  const handleUpdateAssignee = useCallback(
    (taskId: string, assigneeId: string | null) => {
      const assignee = assigneeId
        ? (MOCK_MEMBERS.find((m) => m.id === assigneeId) ?? null)
        : null;

      setBoardState((prev) => patchTask(prev, taskId, { assignee }));
      patchDetail({ assignee });

      // TODO: REPLACE WITH API → updateTask.mutate({ taskId, dto: { assigneeId } })
      console.log("[mock] updateAssignee", { taskId, assigneeId });
    },
    [setBoardState, patchDetail],
  );

  // ── due date ──────────────────────────────────────────────────────────────

  const handleUpdateDueDate = useCallback(
    (taskId: string, dueDate: string | null) => {
      setBoardState((prev) =>
        patchTask(prev, taskId, { dueDate: dueDate ?? undefined }),
      );
      patchDetail({ dueDate: dueDate ?? undefined });

      // TODO: REPLACE WITH API → updateTask.mutate({ taskId, dto: { dueDate } })
      console.log("[mock] updateDueDate", { taskId, dueDate });
    },
    [setBoardState, patchDetail],
  );


  const handleMoveToColumn = useCallback(
    (taskId: string, targetColumnId: string) => {
      setBoardState((prev) => {
        let taskToMove: Task | undefined;
        const tasksWithout = Object.fromEntries(
          Object.entries(prev.tasks).map(([colId, tasks]) => {
            const found = tasks.find((t) => t.id === taskId);
            if (found) taskToMove = { ...found, boardColumnId: targetColumnId };
            return [colId, tasks.filter((t) => t.id !== taskId)];
          }),
        );
        if (!taskToMove) return prev;
        return {
          ...prev,
          tasks: {
            ...tasksWithout,
            [targetColumnId]: [...(tasksWithout[targetColumnId] ?? []), taskToMove],
          },
        };
      });
      patchDetail({ boardColumnId: targetColumnId });

      // TODO: REPLACE WITH API → moveTask.mutate({ taskId, targetColumnId, ... })
      console.log("[mock] moveToColumn", { taskId, targetColumnId });
    },
    [setBoardState, patchDetail],
  );

  // ── toggle subtask ────────────────────────────────────────────────────────

  const handleToggleSubtask = useCallback(
    (subtaskId: string, completed: boolean) => {
      if (!openTaskId) return;

      // 1. حدّث الـ drawer
      setTaskDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: prev.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed } : s,
          ),
        };
      });

      // 2. حدّث الـ completedSubtaskCount على الـ card
      setBoardState((prev) => {
        const task = findTask(prev, openTaskId);
        return patchTask(prev, openTaskId, {
          completedSubtaskCount: completed
            ? (task?.completedSubtaskCount ?? 0) + 1
            : Math.max((task?.completedSubtaskCount ?? 0) - 1, 0),
        });
      });

      // TODO: REPLACE WITH API → toggleSubtask.mutate({ subtaskId, completed })
      console.log("[mock] toggleSubtask", { subtaskId, completed });
    },
    [openTaskId, setBoardState],
  );

  // ── add subtask ───────────────────────────────────────────────────────────

  const handleAddSubtask = useCallback(
    (title: string) => {
      if (!openTaskId) return;

      const newSubtask = {
        id: crypto.randomUUID(),
        taskId: openTaskId,
        title,
        completed: false,
        position: 0, // سيتحدد من الـ backend لما يجي
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. حدّث الـ drawer
      setTaskDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: [...prev.subtasks, newSubtask],
        };
      });

      // 2. حدّث الـ subtaskCount على الـ card
      setBoardState((prev) => {
        const task = findTask(prev, openTaskId);
        return patchTask(prev, openTaskId, {
          subtaskCount: (task?.subtaskCount ?? 0) + 1,
        });
      });

      // TODO: REPLACE WITH API → createSubtask.mutate({ taskId: openTaskId, title })
      console.log("[mock] addSubtask", { taskId: openTaskId, title });
    },
    [openTaskId, setBoardState],
  );

  // ── delete subtask ────────────────────────────────────────────────────────

  const handleDeleteSubtask = useCallback(
    (subtaskId: string) => {
      if (!openTaskId) return;

      // 1. حدّث الـ drawer
      setTaskDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: prev.subtasks.filter((s) => s.id !== subtaskId),
        };
      });

      // 2. حدّث الـ subtaskCount على الـ card
      setBoardState((prev) => {
        const task = findTask(prev, openTaskId);
        return patchTask(prev, openTaskId, {
          subtaskCount: Math.max((task?.subtaskCount ?? 0) - 1, 0),
        });
      });

      // TODO: REPLACE WITH API → deleteSubtask.mutate(subtaskId)
      console.log("[mock] deleteSubtask", { subtaskId });
    },
    [openTaskId, setBoardState],
  );

  // ── add comment ───────────────────────────────────────────────────────────

  const handleAddComment = useCallback(
    (content: string) => {
      if (!openTaskId) return;

      setIsSubmittingComment(true);

      const newComment = {
        id: crypto.randomUUID(),
        taskId: openTaskId,
        author: CURRENT_USER,
        content,
        createdAt: new Date().toISOString(),
      };

  
      setTaskDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        };
      });

      setBoardState((prev) => {
        const task = findTask(prev, openTaskId);
        return patchTask(prev, openTaskId, {
          commentCount: (task?.commentCount ?? 0) + 1,
        });
      });

      // TODO: REPLACE WITH API → createComment.mutate({ taskId: openTaskId, content })
      //       وبعدين في onSettled تعمل setIsSubmittingComment(false)
      console.log("[mock] addComment", { taskId: openTaskId, content });

      // simulate async (اشيل السطرين دول لما الـ API يجي)
      setTimeout(() => setIsSubmittingComment(false), 300);
    },
    [openTaskId, setBoardState],
  );

  // ── return ────────────────────────────────────────────────────────────────

  return {
    openDrawer,
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