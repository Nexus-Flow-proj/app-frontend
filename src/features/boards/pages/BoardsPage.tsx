import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { AddColumnDialog } from "../components/kanban/AddColumnDialog";
import {
  AddTaskDialog,
  type NewTaskFormData,
} from "../components/kanban/AddTaskDialog";
import { TaskDetailDrawer } from "../components/drawers/TaskDetailDrawer";
import { BoardFilters } from "../components/Topbar/BoardFilters";
import { BoardSearchBar } from "../components/Topbar/BoardSearchBar";
import { Button } from "@/components/ui/button";
import {
  useUrlFilters,
  useSetUrlFilters,
  useResetUrlFilters,
  useActiveFilterCount,
} from "../hooks/useBoardFilters";
import { useBoardDnd } from "../hooks/useBoardDnd";
import { useBoardState as useRemoteBoardState } from "../hooks/useBoardState";
import { useCreateBoardColumn } from "../hooks/useCreateBoardColumn";
import { useCreateComment } from "../hooks/useCreateComment";
import { useCreateSubtask } from "../hooks/useCreateSubtask";
import { useCreateTask } from "../hooks/useCreateTask";
import { useCreateTimeLog } from "../hooks/useCreateTimeLog";
import { useDeleteBoardColumn } from "../hooks/useDeleteBoardColumn";
import { useDeleteComment } from "../hooks/useDeleteComment";
import { useDeleteSubtask } from "../hooks/useDeleteSubtask";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { useDeleteTimeLog } from "../hooks/useDeleteTimeLog";
import { useTask } from "../hooks/useTask";
import { useTimeLogs } from "../hooks/useTimeLogs";
import {
  useUpdateBoardColumn,
  useUpdateBoardColumnById,
} from "../hooks/useUpdateBoardColumn";
import { useUpdateSubtask } from "../hooks/useUpdateSubtask";
import { useUpdateComment } from "../hooks/useUpdateComment";
import { useUpdateTask, useUpdateTaskById } from "../hooks/useUpdateTask";
import type { BoardMember, Task } from "../types";
import { TaskStatus, TaskType } from "../types/enums";
import KanbanBoardColumn from "../components/kanban/kanbanboard-column";
import TaskCard from "../components/kanban/task-card";
import { useKanbanStore } from "@/store";
import { useAuthStore } from "@/store/authStore";
import { useProjectMembers } from "@/features/project/hooks";
import type { ProjectMemberSummary } from "@/features/project/types";
import BoardInfo from "../components/Topbar/BoardInfo";
import { useProjectRealTime } from "@/hooks/realtime/useProjectRealtime";

const boardCollisionStrategy: CollisionDetection = (args) => {
  const { active, droppableContainers } = args;
  const activeType = active.data.current?.type;

  if (activeType === "Column") {
    return closestCorners({
      ...args,
      droppableContainers: droppableContainers.filter(
        (container) => container.data.current?.type === "Column",
      ),
    });
  }

  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length > 0
    ? pointerCollisions
    : closestCorners(args);
};

function mapProjectMemberToBoardMember(member: ProjectMemberSummary): BoardMember {
  const name = `${member.firstName} ${member.lastName}`.trim() || member.email;

  return {
    id: member.userId,
    name,
    avatarUrl: member.avatarUrl ?? undefined,
    avatar: member.avatarUrl ?? undefined,
    isActive: member.isOnline,
  };
}

function mapUserToBoardMember(user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>): BoardMember {
  const name =
    user.name ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.email;

  return {
    id: user.id,
    name,
    avatarUrl: user.avatarUrl ?? user.avatar,
    avatar: user.avatar ?? user.avatarUrl,
    isActive: true,
  };
}

function BoardsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  useProjectRealTime(projectId);
  const resolvedProjectId = projectId ?? "";
  const currentUser = useAuthStore((state) => state.user);
  const filters = useUrlFilters();
  const setFilters = useSetUrlFilters();
  const resetFilters = useResetUrlFilters();
  const activeCount = useActiveFilterCount();
  const remoteBoard = useRemoteBoardState(resolvedProjectId);
  const projectMembersQuery = useProjectMembers(resolvedProjectId);

  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const isAddTaskOpen = addTaskColumnId !== null;

  const boardState = useKanbanStore((state) => state.boardState);
  const drawer = useKanbanStore((state) => state.drawer);
  const initializeBoard = useKanbanStore((state) => state.initializeBoard);
  const setBoardState = useKanbanStore((state) => state.setBoardState);
  const openTaskDrawer = useKanbanStore((state) => state.openTaskDrawer);
  const setDrawerTask = useKanbanStore((state) => state.setDrawerTask);
  const setDrawerLoading = useKanbanStore((state) => state.setDrawerLoading);
  const closeTaskDrawer = useKanbanStore((state) => state.closeTaskDrawer);
  const moveTaskToColumn = useKanbanStore((state) => state.moveTaskToColumn);
  const activeTaskId = drawer.activeTaskId ?? "";
  const taskDetailQuery = useTask(activeTaskId);
  const timeLogsQuery = useTimeLogs(activeTaskId);
  const createColumnMutation = useCreateBoardColumn(resolvedProjectId);
  const updateColumnMutation = useUpdateBoardColumn(
    resolvedProjectId,
    editingColumnId ?? "",
  );
  const updateColumnByIdMutation = useUpdateBoardColumnById(resolvedProjectId);
  const deleteColumnMutation = useDeleteBoardColumn(resolvedProjectId);
  const createTaskMutation = useCreateTask(resolvedProjectId);
  const updateTaskMutation = useUpdateTask(resolvedProjectId, activeTaskId);
  const updateTaskByIdMutation = useUpdateTaskById(resolvedProjectId);
  const deleteTaskMutation = useDeleteTask(resolvedProjectId);
  const createSubtaskMutation = useCreateSubtask(activeTaskId);
  const updateSubtaskMutation = useUpdateSubtask(activeTaskId);
  const deleteSubtaskMutation = useDeleteSubtask(activeTaskId);

  const columns = boardState.columnOrder.map((id) => boardState.columns[id]);
  const editingColumn = editingColumnId
    ? boardState.columns[editingColumnId]
    : null;
  const members = useMemo(
    () => (projectMembersQuery.data ?? []).map(mapProjectMemberToBoardMember),
    [projectMembersQuery.data],
  );
  const currentBoardUser = useMemo<BoardMember>(() => {
    if (currentUser) {
      return mapUserToBoardMember(currentUser);
    }

    return (
      members[0] ?? {
        id: "current-user",
        name: "Current user",
        isActive: true,
      }
    );
  }, [currentUser, members]);
  const createCommentMutation = useCreateComment(
    activeTaskId,
    currentBoardUser,
  );
  const updateCommentMutation = useUpdateComment(
    activeTaskId,
    currentBoardUser,
  );
  const deleteCommentMutation = useDeleteComment(activeTaskId);
  const createTimeLogMutation = useCreateTimeLog(
    activeTaskId,
    currentBoardUser,
  );
  const deleteTimeLogMutation = useDeleteTimeLog(activeTaskId);

  const boardDnd = useBoardDnd({
    boardState,
    setBoardState,
    onMoveTask: (taskId, sourceColId, targetColId, newPositionFloat) => {
      updateTaskByIdMutation.mutate({
        taskId,
        dto: {
          columnOrder: newPositionFloat,
          ...(sourceColId !== targetColId
            ? { boardColumnId: targetColId }
            : {}),
        },
      });
    },
    onMoveColumn: (columnId, newPositionFloat) => {
      const column = boardState.columns[columnId];
      if (!column) return;

      updateColumnByIdMutation.mutate({
        columnId,
        dto: {
          name: column.name,
          sortOrder: newPositionFloat,
        },
      });
    },
  });

  useEffect(() => {
    if (!remoteBoard.boardState || !projectId) return;
    initializeBoard(remoteBoard.boardState, projectId);
  }, [initializeBoard, projectId, remoteBoard.boardState]);

  useEffect(() => {
    if (!drawer.isOpen || !drawer.activeTaskId) return;
    setDrawerLoading(taskDetailQuery.isLoading);
  }, [
    drawer.activeTaskId,
    drawer.isOpen,
    setDrawerLoading,
    taskDetailQuery.isLoading,
  ]);

  useEffect(() => {
    if (!taskDetailQuery.data) return;
    setDrawerTask(taskDetailQuery.data);
    setDrawerLoading(false);
  }, [setDrawerLoading, setDrawerTask, taskDetailQuery.data]);

  const openDrawerWithBackendDetail = useCallback(
    (task: Task) => {
      openTaskDrawer(task);
    },
    [openTaskDrawer],
  );

  const handleColumnSubmit = useCallback(
    (data: { name: string; color: string }) => {
      if (editingColumnId) {
        updateColumnMutation.mutate(
          {
            name: data.name,
            color: data.color,
          },
          {
            onSuccess: () => {
              setEditingColumnId(null);
            },
          },
        );
        return;
      }

      createColumnMutation.mutate(
        {
          name: data.name,
          color: data.color,
        },
        {
          onSuccess: () => {
            setIsAddColumnOpen(false);
          },
        },
      );
    },
    [createColumnMutation, editingColumnId, updateColumnMutation],
  );

  const handleAddTask = useCallback(
    (data: NewTaskFormData) => {
      const label = data.tags[0]?.trim() || undefined;

      createTaskMutation.mutate({
        columnId: data.columnId,
        dto: {
          title: data.title,
          description: data.description || undefined,
          deadline: data.dueDate ?? undefined,
          label,
          type: TaskType.FEATURE,
          status: TaskStatus.TODO,
          priority: data.priority,
          assigneeId: data.assigneeId ?? undefined,
        },
      });
    },
    [createTaskMutation],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTaskMutation.mutate(taskId, {
        onSuccess: () => {
          closeTaskDrawer();
        },
      });
    },
    [closeTaskDrawer, deleteTaskMutation],
  );

  const handleMoveTaskToColumn = useCallback(
    (taskId: string, targetColumnId: string) => {
      const sourceColumnId = Object.entries(boardState.tasks).find(([, tasks]) =>
        tasks.some((task) => task.id === taskId),
      )?.[0];

      if (!sourceColumnId || sourceColumnId === targetColumnId) return;

      const targetTasks = boardState.tasks[targetColumnId] ?? [];
      const newColumnOrder =
        targetTasks.reduce(
          (max, task) => Math.max(max, task.columnOrder ?? 0),
          0,
        ) + 1;

      moveTaskToColumn(taskId, targetColumnId);
      updateTaskByIdMutation.mutate({
        taskId,
        dto: {
          boardColumnId: targetColumnId,
          columnOrder: newColumnOrder,
        },
      });
    },
    [boardState.tasks, moveTaskToColumn, updateTaskByIdMutation],
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-5 flex-wrap min-h-13 py-2">
          <BoardInfo />

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <BoardSearchBar
              value={filters.search}
              onChange={(search) => setFilters({ search })}
            />
            <BoardFilters
              filters={filters}
              members={members}
              onChangePriority={(priorities) => setFilters({ priorities })}
              onChangeAssignee={(assigneeIds) => setFilters({ assigneeIds })}
              onChangeDueDate={(dueDateRange) => setFilters({ dueDateRange })}
              onToggleMyTasks={() =>
                setFilters({ showOnlyMyTasks: !filters.showOnlyMyTasks })
              }
              onReset={resetFilters}
              activeCount={activeCount}
            />
            <div className="w-px h-5 bg-border" />

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <Plus className="size-3.5" />
              Add column
            </Button>
          </div>
        </div>
      </header>

      <DndContext
        sensors={boardDnd.sensors}
        collisionDetection={boardCollisionStrategy}
        onDragStart={boardDnd.handleDragStart}
        onDragEnd={boardDnd.handleDragEnd}
      >
        <KanbanBoard
          boardState={boardState}
          onAddColumn={() => setIsAddColumnOpen(true)}
          isLoading={remoteBoard.isLoading}
        >
          {boardState.columnOrder.map((columnId) => (
            <KanbanBoardColumn
              key={columnId}
              columnId={columnId}
              boardState={boardState}
              currentUserId={currentBoardUser.id}
              onCardClick={openDrawerWithBackendDetail}
              onAddTask={setAddTaskColumnId}
              onRenameColumn={setEditingColumnId}
              onDeleteColumn={(id) => deleteColumnMutation.mutate(id)}
            />
          ))}
        </KanbanBoard>

        <DragOverlay>
          {boardDnd.activeTask ? (
            <TaskCard task={boardDnd.activeTask} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {(isAddColumnOpen || editingColumnId) && (
        <AddColumnDialog
          key={editingColumn?.id ?? "new-column"}
          isOpen
          onClose={() => {
            setIsAddColumnOpen(false);
            setEditingColumnId(null);
          }}
          onSubmit={handleColumnSubmit}
          initialData={
            editingColumn
              ? {
                name: editingColumn.name,
                color: editingColumn.color ?? "var(--primary)",
              }
              : null
          }
          title={editingColumn ? "Rename column" : "New column"}
          submitLabel={editingColumn ? "Save changes" : "Add column"}
          isSubmitting={
            createColumnMutation.isPending || updateColumnMutation.isPending
          }
        />
      )}

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        columnId={addTaskColumnId}
        columns={columns}
        members={members}
        onClose={() => setAddTaskColumnId(null)}
        onSubmit={handleAddTask}
      />

      <TaskDetailDrawer
        task={drawer.activeTask}
        columns={columns}
        members={members}
        timeLogs={timeLogsQuery.data?.timeLogs ?? []}
        currentUser={currentBoardUser}
        isOpen={drawer.isOpen}
        isLoading={drawer.isLoading}
        isLoadingTimeLogs={timeLogsQuery.isLoading}
        isSubmittingComment={drawer.isSubmittingComment}
        isDeletingTask={deleteTaskMutation.isPending}
        isUpdatingTask={updateTaskMutation.isPending}
        onClose={closeTaskDrawer}
        onUpdateTitle={(_taskId, title) =>
          updateTaskMutation.mutate({ title })
        }
        onUpdateDescription={(_taskId, description) =>
          updateTaskMutation.mutate({ description })
        }
        onUpdateLabel={(_taskId, label) =>
          updateTaskMutation.mutate({ label })
        }
        onUpdatePriority={(_taskId, priority) =>
          updateTaskMutation.mutate({ priority })
        }
        onUpdateAssignee={(_taskId, assigneeId) =>
          updateTaskMutation.mutate({ assigneeId })
        }
        onUpdateDueDate={(_taskId, date) =>
          updateTaskMutation.mutate({ deadline: date ?? undefined })
        }
        onMoveToColumn={handleMoveTaskToColumn}
        onToggleSubtask={(subtaskId, completed) =>
          updateSubtaskMutation.mutate({
            subtaskId,
            dto: { isCompleted: completed },
          })
        }
        onAddSubtask={(title) =>
          createSubtaskMutation.mutate({
            title,
          })
        }
        onDeleteSubtask={(subtaskId) =>
          deleteSubtaskMutation.mutate(subtaskId)
        }
        onAddComment={(content) =>
          createCommentMutation.mutate({
            body: content,
          })
        }
        onUpdateComment={(commentId, content) =>
          updateCommentMutation.mutate({
            commentId,
            dto: { body: content },
          })
        }
        onDeleteComment={(commentId) => deleteCommentMutation.mutate(commentId)}
        isUpdatingComment={updateCommentMutation.isPending}
        isDeletingComment={deleteCommentMutation.isPending}
        onAddTimeLog={(data) => createTimeLogMutation.mutate(data)}
        onDeleteTimeLog={(timeLogId) => deleteTimeLogMutation.mutate(timeLogId)}
        isSubmittingTimeLog={createTimeLogMutation.isPending}
        isDeletingTimeLog={deleteTimeLogMutation.isPending}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}

export default BoardsPage;
