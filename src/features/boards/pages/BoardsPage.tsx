import { useCallback, useEffect, useState } from "react";
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
import {
  useUrlFilters,
  useSetUrlFilters,
  useResetUrlFilters,
  useActiveFilterCount,
} from "../hooks/useBoardFilters";
import { useBoardDnd } from "../hooks/useBoardDnd";
import type { Task, TaskDetail } from "../types";
import {
  CURRENT_USER,
  MOCK_BOARD,
  MOCK_MEMBERS,
  MOCK_TASK_DETAIL,
} from "../data/mock-data";
import KanbanBoardColumn from "../components/kanban/kanbanboard-column";
import TaskCard from "../components/kanban/task-card";
import { useKanbanStore } from "@/store";
import BoardInfo from "../components/Topbar/BoardInfo";

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

function createEmptyTaskDetail(task: Task): TaskDetail {
  return {
    ...task,
    subtasks: [],
    comments: [],
    activityLog: [],
    attachments: [],
  };
}

function BoardsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const filters = useUrlFilters();
  const setFilters = useSetUrlFilters();
  const resetFilters = useResetUrlFilters();
  const activeCount = useActiveFilterCount();

  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
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
  const addColumn = useKanbanStore((state) => state.addColumn);
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const updateTaskAssignee = useKanbanStore(
    (state) => state.updateTaskAssignee,
  );
  const moveTaskToColumn = useKanbanStore((state) => state.moveTaskToColumn);
  const toggleSubtask = useKanbanStore((state) => state.toggleSubtask);
  const addSubtask = useKanbanStore((state) => state.addSubtask);
  const deleteSubtask = useKanbanStore((state) => state.deleteSubtask);
  const addComment = useKanbanStore((state) => state.addComment);

  const columns = boardState.columnOrder.map((id) => boardState.columns[id]);
  const boardDnd = useBoardDnd({
    boardState,
    setBoardState,
    onMoveTask: (taskId, sourceColId, targetColId, newPositionFloat) =>
      console.log("move task", {
        taskId,
        sourceColId,
        targetColId,
        newPositionFloat,
      }),
    onMoveColumn: (columnId, newPositionFloat) =>
      console.log("move column", { columnId, newPositionFloat }),
  });

  useEffect(() => {
    initializeBoard(MOCK_BOARD, projectId);
  }, [initializeBoard, projectId]);

  const openDrawerWithMockDetail = useCallback(
    (task: Task) => {
      openTaskDrawer(task);
      window.setTimeout(() => {
        setDrawerTask(MOCK_TASK_DETAIL[task.id] ?? createEmptyTaskDetail(task));
        setDrawerLoading(false);
      }, 250);
    },
    [openTaskDrawer, setDrawerLoading, setDrawerTask],
  );

  const handleAddColumn = useCallback(
    (data: { name: string; color: string }) => {
      addColumn(data.name, data.color);
    },
    [addColumn],
  );

  const handleAddTask = useCallback(
    (data: NewTaskFormData) => {
      const assignee = data.assigneeId
        ? (MOCK_MEMBERS.find((member) => member.id === data.assigneeId) ??
          CURRENT_USER)
        : CURRENT_USER;
      const task = addTask(data.columnId, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignee,
        dueDate: data.dueDate,
        tags: data.tags,
      });

      if (task) {
        openTaskDrawer(task);
        setDrawerTask(createEmptyTaskDetail(task));
        setDrawerLoading(false);
      }
    },
    [addTask, openTaskDrawer, setDrawerLoading, setDrawerTask],
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
              members={MOCK_MEMBERS}
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

            <button
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <Plus className="size-3.5" />
              Add column
            </button>
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
        >
          {boardState.columnOrder.map((columnId) => (
            <KanbanBoardColumn
              key={columnId}
              columnId={columnId}
              boardState={boardState}
              onCardClick={openDrawerWithMockDetail}
              onAddTask={setAddTaskColumnId}
            />
          ))}
        </KanbanBoard>

        <DragOverlay>
          {boardDnd.activeTask ? (
            <TaskCard task={boardDnd.activeTask} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddColumnDialog
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onSubmit={handleAddColumn}
      />

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        columnId={addTaskColumnId}
        columns={columns}
        members={MOCK_MEMBERS}
        onClose={() => setAddTaskColumnId(null)}
        onSubmit={handleAddTask}
      />

      <TaskDetailDrawer
        task={drawer.activeTask}
        columns={columns}
        members={MOCK_MEMBERS}
        currentUser={CURRENT_USER}
        isOpen={drawer.isOpen}
        isLoading={drawer.isLoading}
        isSubmittingComment={drawer.isSubmittingComment}
        onClose={closeTaskDrawer}
        onUpdatePriority={(taskId, priority) =>
          updateTask(taskId, { priority })
        }
        onUpdateAssignee={(taskId, assigneeId) =>
          updateTaskAssignee(
            taskId,
            assigneeId
              ? (MOCK_MEMBERS.find((member) => member.id === assigneeId) ??
                  null)
              : null,
          )
        }
        onUpdateDueDate={(taskId, date) =>
          updateTask(taskId, { dueDate: date })
        }
        onMoveToColumn={moveTaskToColumn}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        onDeleteSubtask={deleteSubtask}
        onAddComment={(content) => addComment(content, CURRENT_USER)}
      />
    </div>
  );
}

export default BoardsPage;
