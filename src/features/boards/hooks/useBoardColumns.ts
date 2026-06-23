// features/boards/hooks/useBoardColumns.ts

import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { BoardMember, BoardState, Task } from "../types";
import { TaskPriority, TaskSource, TaskStatus } from "../types/enums";
import { MOCK_MEMBERS } from "../data/mock-data";
import type { NewTaskFormData } from "../components/kanban/AddTaskDialog";
import type { NewColumnData } from "../components/kanban/AddColumnDialog";

interface UseBoardColumnsParams {
  boardState: BoardState;
  setBoardState: Dispatch<SetStateAction<BoardState>>;
  projectId?: string;
  currentUser: BoardMember;
  onTaskAdded?: (task: Task) => void;
}

export function useBoardColumns({
  setBoardState,
  projectId,
  currentUser,
  onTaskAdded,
}: UseBoardColumnsParams) {

  // ── add column ────────────────────────────────────────────────────────────

  const handleAddColumn = useCallback(
    (data: NewColumnData) => {
      const trimmed = data.name.trim();
      if (!trimmed) return;

      const newColumnId = `column-${Date.now()}`;

      setBoardState((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumnId]: {
            id: newColumnId,
            projectId: projectId ?? "p1",
            name: trimmed,
            color: data.color,   
            sortOrder: prev.columnOrder.length,
            isProtected: false,
            createdAt: new Date().toISOString(),
          },
        },
        tasks: { ...prev.tasks, [newColumnId]: [] },
        columnOrder: [...prev.columnOrder, newColumnId],
      }));

      // TODO: REPLACE WITH API → createColumn.mutate({ name: trimmed, color: data.color })
      console.log("[mock] addColumn", data);
    },
    [projectId, setBoardState],
  );

  // ── add task ──────────────────────────────────────────────────────────────

  const handleAddTask = useCallback(
    (data: NewTaskFormData) => {
      const title = data.title.trim();
      if (!title) return;

      const newTaskId = `task-${Date.now()}`;
      const assignee = data.assigneeId
        ? (MOCK_MEMBERS.find((m) => m.id === data.assigneeId) ?? currentUser)
        : currentUser;

      let createdTask!: Task;

      setBoardState((prev) => {
        const newTask: Task = {
          id: newTaskId,
          projectId: projectId ?? "p1",
          createdBy: currentUser.id,
          title,
          description: data.description || undefined,
          status: TaskStatus.TODO,
          priority: data.priority ?? TaskPriority.MEDIUM,
          dueDate: data.dueDate ?? undefined,
          boardColumnId: data.columnId,
          columnOrder: (prev.tasks[data.columnId] ?? []).length,
          source: TaskSource.MANUAL,
          createdAt: new Date().toISOString(),
          assignee,
          subtaskCount: 0,
          completedSubtaskCount: 0,
          commentCount: 0,
          attachmentCount: 0,
          tags: data.tags ?? [],
        };

        createdTask = newTask;

        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [data.columnId]: [newTask, ...(prev.tasks[data.columnId] ?? [])],
          },
        };
      });

      // TODO: REPLACE WITH API → createTask.mutate({ columnId, title, priority, ... })
      console.log("[mock] addTask", data);

      onTaskAdded?.(createdTask);
    },
    [projectId, currentUser, setBoardState, onTaskAdded],
  );

  return { handleAddColumn, handleAddTask };
}