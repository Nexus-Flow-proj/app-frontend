import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
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
import { ProjectChatWidget } from "@/features/chat";
import {
  useUrlFilters,
  useSetUrlFilters,
  useResetUrlFilters,
  useActiveFilterCount,
} from "../hooks/useBoardFilters";
import { useBoardDnd } from "../hooks/useBoardDnd";
import { useBoardState as useRemoteBoardState } from "../hooks/useBoardState";
import { useAiAssigneeRecommendation } from "../hooks/useAiAssigneeRecommendation";
import { useAiTaskBreakdown } from "../hooks/useAiTaskBreakdown";
import { useAiTaskDescription } from "../hooks/useAiTaskDescription";
import { useCreateBoardColumn } from "../hooks/useCreateBoardColumn";
import { useCreateComment } from "../hooks/useCreateComment";
import { useCreateSubtask } from "../hooks/useCreateSubtask";
import { useCreateTask } from "../hooks/useCreateTask";
import { useCreateTimeLog } from "../hooks/useCreateTimeLog";
import { useDeleteBoardColumn } from "../hooks/useDeleteBoardColumn";
import { useDeleteComment } from "../hooks/useDeleteComment";
import { useDeleteSubtask } from "../hooks/useDeleteSubtask";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { useDeleteTaskAttachment } from "../hooks/useDeleteTaskAttachment";
import { useDeleteTimeLog } from "../hooks/useDeleteTimeLog";
import { useTask } from "../hooks/useTask";
import { useTimeLogs } from "../hooks/useTimeLogs";
import {
  useUpdateBoardColumn,
} from "../hooks/useUpdateBoardColumn";
import { useReorderBoardColumns } from "../hooks/useReorderBoardColumns";
import { useUpdateSubtask } from "../hooks/useUpdateSubtask";
import { useUpdateComment } from "../hooks/useUpdateComment";
import { useUpdateTask, useUpdateTaskById } from "../hooks/useUpdateTask";
import { useUploadTaskAttachments } from "../hooks/useUploadTaskAttachments";
import type { BoardMember, Task } from "../types";
import {
  TaskStatus,
  TaskType,
  type TaskStatus as TaskStatusValue,
} from "../types/enums";
import KanbanBoardColumn from "../components/kanban/kanbanboard-column";
import TaskCard from "../components/kanban/task-card";
import { useKanbanStore } from "@/store";
import { useAuthStore } from "@/store/authStore";
import { useProjectAccess, useProjectMembers } from "@/features/project/hooks";
import type { ProjectMemberSummary } from "@/features/project/types";
import BoardInfo from "../components/Topbar/BoardInfo";
import { BoardSyncIndicator } from "../components/Topbar/BoardSyncIndicator";
import { useProjectRealTime } from "@/hooks/realtime/useProjectRealtime";
import { getTaskStatusFromColumnName } from "../utils/task-status";
import { ProjectWorkspaceNavigation } from "@/components/shared/ProjectWorkspaceNavigation";
import DarkModeToggle from "@/components/shared/ModeToggle";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import {
  canCreateTasks,
  canDeleteTasks,
  canManageColumns,
  canMoveTasks,
  canReorderColumns,
  canUpdateTasks,
} from "@/features/project/utils/rolePermissions";

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

function mapProjectMemberToBoardMember(
  member: ProjectMemberSummary,
): BoardMember {
  const name = `${member.firstName} ${member.lastName}`.trim() || member.email;

  return {
    id: member.userId,
    name,
    avatarUrl: member.avatarUrl ?? undefined,
    avatar: member.avatarUrl ?? undefined,
    isActive: member.isOnline,
  };
}

function mapUserToBoardMember(
  user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>,
): BoardMember {
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

function getColumnTaskStatus(
  boardState: ReturnType<typeof useKanbanStore.getState>["boardState"],
  columnId: string,
  fallback: TaskStatusValue = TaskStatus.TODO,
) {
  return getTaskStatusFromColumnName(
    boardState.columns[columnId]?.name,
    fallback,
  );
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
  const projectQuery = useProjectAccess(resolvedProjectId);

  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const isAddTaskOpen = addTaskColumnId !== null;

  const boardState = useKanbanStore((state) => state.boardState);
  const drawer = useKanbanStore((state) => state.drawer);
  const syncStatus = useKanbanStore((state) => state.sync.status);
  const initializeBoard = useKanbanStore((state) => state.initializeBoard);
  const setBoardState = useKanbanStore((state) => state.setBoardState);
  const openTaskDrawer = useKanbanStore((state) => state.openTaskDrawer);
  const setDrawerTask = useKanbanStore((state) => state.setDrawerTask);
  const setDrawerLoading = useKanbanStore((state) => state.setDrawerLoading);
  const closeTaskDrawer = useKanbanStore((state) => state.closeTaskDrawer);
  const moveTaskToColumn = useKanbanStore((state) => state.moveTaskToColumn);
  const recordLocalTaskMove = useKanbanStore(
    (state) => state.recordLocalTaskMove,
  );
  const activeTaskId = drawer.activeTaskId ?? "";
  const taskDetailQuery = useTask(activeTaskId);
  const timeLogsQuery = useTimeLogs(activeTaskId);
  const {
    data: aiAssigneeRecommendationResponse,
    isPending: isRecommendingAssignee,
    mutate: recommendAssignee,
    reset: resetAssigneeRecommendation,
  } = useAiAssigneeRecommendation(resolvedProjectId, activeTaskId);
  const {
    isPending: isGeneratingTaskBreakdown,
    mutate: generateTaskBreakdown,
    reset: resetTaskBreakdown,
  } = useAiTaskBreakdown(resolvedProjectId, activeTaskId);
  const {
    isPending: isGeneratingTaskDescription,
    mutate: generateTaskDescription,
    reset: resetTaskDescription,
  } = useAiTaskDescription(resolvedProjectId, activeTaskId);
  const createColumnMutation = useCreateBoardColumn(resolvedProjectId);
  const updateColumnMutation = useUpdateBoardColumn(
    resolvedProjectId,
    editingColumnId ?? "",
  );
  const reorderColumnsMutation = useReorderBoardColumns(resolvedProjectId);
  const deleteColumnMutation = useDeleteBoardColumn(resolvedProjectId);
  const createTaskMutation = useCreateTask(resolvedProjectId);
  const updateTaskMutation = useUpdateTask(resolvedProjectId, activeTaskId);
  const updateTaskByIdMutation = useUpdateTaskById(resolvedProjectId);
  const deleteTaskMutation = useDeleteTask(resolvedProjectId);
  const createSubtaskMutation = useCreateSubtask(activeTaskId);
  const updateSubtaskMutation = useUpdateSubtask(activeTaskId);
  const deleteSubtaskMutation = useDeleteSubtask(activeTaskId);

  const columns = boardState.columnOrder.map((id) => boardState.columns[id]);
  const currentRole = projectQuery.data?.currentMember?.role ?? null;
  const isAdminRole =
    projectQuery.data?.currentMember?.isAdmin === true ||
    (currentRole?.level ?? 0) >= 100;
  const canCreateTask =
    isAdminRole || (currentRole ? canCreateTasks(currentRole) : false);
  const canEditTask =
    isAdminRole || (currentRole ? canUpdateTasks(currentRole) : false);
  const canDeleteTask =
    isAdminRole || (currentRole ? canDeleteTasks(currentRole) : false);
  const canMoveTask =
    isAdminRole || (currentRole ? canMoveTasks(currentRole) : false);
  const canManageColumn =
    isAdminRole || (currentRole ? canManageColumns(currentRole) : false);
  const canMoveColumn =
    isAdminRole || (currentRole ? canReorderColumns(currentRole) : false);
  const tasks = useMemo(
    () => boardState.columnOrder.flatMap((id) => boardState.tasks[id] ?? []),
    [boardState],
  );
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
  const uploadAttachmentsMutation = useUploadTaskAttachments(
    resolvedProjectId,
    activeTaskId,
  );
  const deleteAttachmentMutation = useDeleteTaskAttachment(
    resolvedProjectId,
    activeTaskId,
  );

  const boardDnd = useBoardDnd({
    boardState,
    setBoardState,
    canMoveTasks: canMoveTask,
    canMoveColumns: canMoveColumn,
    onMoveTask: (taskId, sourceColId, targetColId, newPositionFloat) => {
      if (!canMoveTask) return;

      const movingTask = boardState.tasks[sourceColId]?.find(
        (task) => task.id === taskId,
      );
      const status = getColumnTaskStatus(
        boardState,
        targetColId,
        movingTask?.status ?? TaskStatus.TODO,
      );

      recordLocalTaskMove(taskId, {
        boardColumnId: targetColId,
        columnOrder: newPositionFloat,
        status,
      });

      updateTaskByIdMutation.mutate({
        taskId,
        dto: {
          columnOrder: newPositionFloat,
          status,
          ...(sourceColId !== targetColId
            ? { boardColumnId: targetColId }
            : {}),
        },
      });
    },
    onMoveColumn: (columnId, newPositionFloat) => {
      const column = boardState.columns[columnId];
      if (!column || !canMoveColumn) return;

      reorderColumnsMutation.mutate({
        columns: boardState.columnOrder
          .flatMap((id) => {
            const boardColumn = boardState.columns[id];
            return boardColumn ? [boardColumn] : [];
          })
          .map((boardColumn) => ({
            id: boardColumn.id,
            sortOrder:
              boardColumn.id === columnId
                ? newPositionFloat
                : boardColumn.sortOrder,
          })),
      });
    },
  });

  useEffect(() => {
    if (!remoteBoard.boardState || !projectId) return;
    initializeBoard(remoteBoard.boardState, projectId);
  }, [initializeBoard, projectId, remoteBoard.boardState]);

  // ── Auto-open task drawer from URL search param (e.g. ?task=<id>) ────────
  const [searchParams, setSearchParams] = useSearchParams();
  const taskParamConsumed = useRef(false);

  useEffect(() => {
    const targetTaskId = searchParams.get("task");
    if (!targetTaskId || taskParamConsumed.current) return;

    // Wait until the board is fully loaded
    if (remoteBoard.isLoading || boardState.columnOrder.length === 0) return;

    // Find the task in the board state
    const task = Object.values(boardState.tasks)
      .flat()
      .find((t) => t.id === targetTaskId);

    if (task) {
      openTaskDrawer(task);
    } else {
      toast.error("Task not found on this board", {
        description:
          "The task may have been deleted or moved to another project.",
      });
    }

    // Mark as consumed and clear the param
    taskParamConsumed.current = true;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("task");
        return next;
      },
      { replace: true },
    );
  }, [
    searchParams,
    boardState.columnOrder.length,
    boardState.tasks,
    remoteBoard.isLoading,
    openTaskDrawer,
    setSearchParams,
  ]);

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

  useEffect(() => {
    resetAssigneeRecommendation();
    resetTaskBreakdown();
    resetTaskDescription();
  }, [
    activeTaskId,
    resetAssigneeRecommendation,
    resetTaskBreakdown,
    resetTaskDescription,
  ]);

  const openDrawerWithBackendDetail = useCallback(
    (task: Task) => {
      openTaskDrawer(task);
    },
    [openTaskDrawer],
  );

  const handleColumnSubmit = useCallback(
    (data: { name: string; color: string }) => {
      if (!canManageColumn) return;

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

      createColumnMutation.mutate({
        name: data.name,
        color: data.color,
      });
      setIsAddColumnOpen(false);
    },
    [canManageColumn, createColumnMutation, editingColumnId, updateColumnMutation],
  );

  const handleAddTask = useCallback(
    (data: NewTaskFormData) => {
      if (!canCreateTask) return;

      const label = data.tags[0]?.trim() || undefined;

      createTaskMutation.mutate({
        columnId: data.columnId,
        dto: {
          title: data.title,
          dependencyIds: data.dependencyIds,
          description: data.description || undefined,
          deadline: data.dueDate ?? undefined,
          label,
          type: TaskType.FEATURE,
          status: getColumnTaskStatus(boardState, data.columnId),
          priority: data.priority,
          assigneeId: data.assigneeId ?? undefined,
        },
      });
    },
    [boardState, canCreateTask, createTaskMutation],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      if (!canDeleteTask) return;

      deleteTaskMutation.mutate(taskId, {
        onSuccess: () => {
          closeTaskDrawer();
        },
      });
    },
    [canDeleteTask, closeTaskDrawer, deleteTaskMutation],
  );

  const handleMoveTaskToColumn = useCallback(
    (taskId: string, targetColumnId: string) => {
      if (!canMoveTask) return;

      const sourceColumnId = Object.entries(boardState.tasks).find(
        ([, tasks]) => tasks.some((task) => task.id === taskId),
      )?.[0];
      const movingTask = sourceColumnId
        ? boardState.tasks[sourceColumnId]?.find((task) => task.id === taskId)
        : undefined;

      if (!sourceColumnId || sourceColumnId === targetColumnId) return;

      const targetTasks = boardState.tasks[targetColumnId] ?? [];
      const newColumnOrder =
        targetTasks.reduce(
          (max, task) => Math.max(max, task.columnOrder ?? 0),
          0,
        ) + 1;
      const status = getColumnTaskStatus(
        boardState,
        targetColumnId,
        movingTask?.status ?? TaskStatus.TODO,
      );

      moveTaskToColumn(taskId, targetColumnId);
      recordLocalTaskMove(taskId, {
        boardColumnId: targetColumnId,
        columnOrder: newColumnOrder,
        status,
      });
      updateTaskByIdMutation.mutate({
        taskId,
        dto: {
          boardColumnId: targetColumnId,
          columnOrder: newColumnOrder,
          status,
        },
      });
    },
    [boardState, canMoveTask, moveTaskToColumn, recordLocalTaskMove, updateTaskByIdMutation],
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-5 flex-wrap min-h-13 py-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Back to workshop"
          >
            <Link to={`/projects/${projectId}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <BoardInfo />
          <BoardSyncIndicator status={syncStatus} />
          <ProjectWorkspaceNavigation
            projectId={resolvedProjectId}
            draftId={projectQuery.data?.draftId}
            current="board"
            className="bottom-20"
          />

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <BoardSearchBar
              value={filters.search}
              onChange={(search) => setFilters({ search })}
            />
            <BoardFilters
              filters={filters}
              members={members}
              onChangeStatus={(statuses) => setFilters({ statuses })}
              onChangePriority={(priorities) => setFilters({ priorities })}
              onChangeAssignee={(assigneeIds) => setFilters({ assigneeIds })}
              onChangeDueDate={(dueDateRange) => setFilters({ dueDateRange })}
              onToggleMyTasks={() =>
                setFilters({ showOnlyMyTasks: !filters.showOnlyMyTasks })
              }
              onReset={resetFilters}
              activeCount={activeCount}
            />
            <NotificationCenter />
            <DarkModeToggle />

            <div className="w-px h-5 bg-border" />

            {canManageColumn && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setIsAddColumnOpen(true)}
              >
                <Plus className="size-3.5" />
                Add column
              </Button>
            )}
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
          onAddColumn={
            canManageColumn ? () => setIsAddColumnOpen(true) : undefined
          }
          isLoading={remoteBoard.isLoading}
        >
          {boardState.columnOrder.map((columnId) => (
            <KanbanBoardColumn
              key={columnId}
              columnId={columnId}
              boardState={boardState}
              currentUserId={currentBoardUser.id}
              canCreateTask={canCreateTask}
              canManageColumn={canManageColumn}
              canMoveColumn={canMoveColumn}
              canMoveTask={canMoveTask}
              onCardClick={openDrawerWithBackendDetail}
              onAddTask={setAddTaskColumnId}
              onRenameColumn={
                canManageColumn ? setEditingColumnId : undefined
              }
              onDeleteColumn={
                canManageColumn
                  ? (id) => deleteColumnMutation.mutate(id)
                  : undefined
              }
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

      {canCreateTask && (
        <AddTaskDialog
          isOpen={isAddTaskOpen}
          columnId={addTaskColumnId}
          columns={columns}
          members={members}
          onClose={() => setAddTaskColumnId(null)}
          onSubmit={handleAddTask}
        />
      )}

      <TaskDetailDrawer
        task={drawer.activeTask}
        tasks={tasks}
        columns={columns}
        members={members}
        timeLogs={timeLogsQuery.data?.timeLogs ?? []}
        currentUser={currentBoardUser}
        canEditTask={canEditTask}
        canMoveTask={canMoveTask}
        canDeleteTask={canDeleteTask}
        isOpen={drawer.isOpen}
        isLoading={drawer.isLoading}
        isLoadingTimeLogs={timeLogsQuery.isLoading}
        assigneeRecommendation={aiAssigneeRecommendationResponse?.data}
        isRecommendingAssignee={isRecommendingAssignee}
        onRecommendAssignee={() => recommendAssignee()}
        onClearAssigneeRecommendation={resetAssigneeRecommendation}
        isGeneratingTaskBreakdown={isGeneratingTaskBreakdown}
        onGenerateTaskBreakdown={(onSuccess) =>
          generateTaskBreakdown(undefined, {
            onSuccess: (response) => onSuccess(response.data.subtasks),
          })
        }
        isGeneratingTaskDescription={isGeneratingTaskDescription}
        onGenerateTaskDescription={(onSuccess) =>
          generateTaskDescription(undefined, {
            onSuccess: (response) => onSuccess(response.data),
          })
        }
        isSubmittingComment={drawer.isSubmittingComment}
        isDeletingTask={deleteTaskMutation.isPending}
        isUpdatingTask={
          updateTaskMutation.isPending ||
          createSubtaskMutation.isPending ||
          updateSubtaskMutation.isPending ||
          deleteSubtaskMutation.isPending
        }
        onClose={closeTaskDrawer}
        onSaveChanges={(_taskId, dto) => updateTaskMutation.mutate(dto)}
        onCreateSubtask={(dto) => createSubtaskMutation.mutate(dto)}
        onUpdateSubtask={(subtaskId, dto) =>
          updateSubtaskMutation.mutate({
            subtaskId,
            dto,
          })
        }
        onDeleteSubtask={(subtaskId) => deleteSubtaskMutation.mutate(subtaskId)}
        onMoveToColumn={handleMoveTaskToColumn}
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
        onUploadAttachments={(files) =>
          uploadAttachmentsMutation.mutate({ files })
        }
        isUploadingAttachments={uploadAttachmentsMutation.isPending}
        onDeleteAttachment={(attachmentId) =>
          deleteAttachmentMutation.mutate(attachmentId)
        }
        isDeletingAttachment={deleteAttachmentMutation.isPending}
        onDeleteTask={handleDeleteTask}
      />
      <ProjectChatWidget explicitProjectId={resolvedProjectId} />
    </div>
  );
}

export default BoardsPage;
