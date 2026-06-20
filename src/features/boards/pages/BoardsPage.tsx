// features/boards/pages/BoardsPage.tsx
// Route: /projects/:id/boards
// All filters are URL-driven via useSearchParams — shareable, back-button safe.
// TODO merge day: replace MOCK_* with Dev 3's hooks (useBoardColumns, useTasksByColumn, useMoveTask).
// TODO merge day: wrap KanbanBoard children with DndContext + DragOverlay from Dev 1.

import { useState } from "react";
import { useParams } from "react-router";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";

import { KanbanBoard } from "../components/kanban/KanbanBoard";
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
import { useTaskDatail } from "../hooks/useTaskDatail";
import type { Task } from "../types";
import {
  CURRENT_USER,
  MOCK_BOARD,
  MOCK_MEMBERS,
  MOCK_TASK_DETAIL,
} from "../data/mock-data";
import KanbanBoardColumn from "../components/kanban/kanbanboard-column";
import TaskCard from "../components/kanban/task-card";

// ─── Page ─────────────────────────────────────────────────────────────────────
function BoardsPage() {
  const { id: projectId } = useParams<{ id: string }>();

  // ── filters (URL-driven) ──────────────────────────────────────────────────
  const filters = useUrlFilters();
  const setFilters = useSetUrlFilters();
  const resetFilters = useResetUrlFilters();
  const activeCount = useActiveFilterCount();

  // ── board state ───────────────────────────────────────────────────────────
  const [boardState, setBoardState] = useState(MOCK_BOARD);
  const columns = boardState.columnOrder.map((id) => boardState.columns[id]);

  // ── drag-and-drop ─────────────────────────────────────────────────────────
  const boardDnd = useBoardDnd({
    boardState,
    setBoardState,
    onMoveTask: (taskId, sourceColId, targetColId, newPositionFloat) =>
      console.log("move task", {
        taskId,
        sourceColId,
        targetColId,
        newPositionFloat
      }),
    onMoveColumn: (columnId, newPositionFloat) =>
      console.log("move column", { columnId, newPositionFloat }),
  });

  // ── drawer (all detail logic lives here) ──────────────────────────────────
  const drawer = useTaskDatail({
    boardState,
    setBoardState,
    currentUser: CURRENT_USER,
    // TODO merge day: replace with real fetch, e.g.:
    //   fetchTaskDetail: (id) => api.tasks.getDetail(id),
    fetchTaskDetail: async (taskId) => {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 250));
      const card = Object.values(boardState.tasks)
        .flat()
        .find((t) => t.id === taskId);
      return (
        MOCK_TASK_DETAIL[taskId] ?? {
          ...card!,
          subtasks: [],
          comments: [],
          activityLog: [],
        }
      );
    },
  });

  const handleCardClick = (task: Task) => drawer.openDrawer(task);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Topbar ── */}
      <header className="border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-5 flex-wrap min-h-13 py-2">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-foreground">Team Board</h1>
            <span className="text-xs text-muted-foreground">— {projectId}</span>
          </div>

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
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground
                        text-xs font-medium hover:bg-primary/90 transition-colors"
              onClick={() => console.log("add column")}
            >
              + Add column
            </button>
          </div>
        </div>
      </header>

      {/* ── Board ── */}
      <DndContext
        sensors={boardDnd.sensors}
        collisionDetection={closestCorners}
        onDragStart={boardDnd.handleDragStart}
        onDragEnd={boardDnd.handleDragEnd}
      >
        <KanbanBoard
          boardState={boardState}
          onAddColumn={() => console.log("add column")}
        >
          {boardState.columnOrder.map((columnId) => (
            <KanbanBoardColumn
              key={columnId}
              columnId={columnId}
              boardState={boardState}
              onCardClick={handleCardClick}
              onAddTask={(colId) => console.log("add task to", colId)}
            />
          ))}
        </KanbanBoard>

        <DragOverlay>
          {boardDnd.activeTask ? (
            <TaskCard task={boardDnd.activeTask} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Drawer ── */}
      <TaskDetailDrawer
        {...drawer.drawerProps}
        columns={columns}
        members={MOCK_MEMBERS}
        currentUser={CURRENT_USER}
      />
    </div>
  );
}

export default BoardsPage;


