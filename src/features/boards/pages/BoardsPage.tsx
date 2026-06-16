// features/boards/pages/BoardsPage.tsx
// Route: /projects/:id/boards
// All filters are URL-driven via useSearchParams — shareable, back-button safe.
// TODO merge day: replace MOCK_* with Dev 3's hooks (useBoardColumns, useTasksByColumn, useMoveTask).
// TODO merge day: wrap KanbanBoard children with DndContext + DragOverlay from Dev 1.

import { useState, useCallback } from "react";
import { useParams } from "react-router";
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
import type { Task, TaskDetail } from "../types";
import {
  CURRENT_USER,
  MOCK_BOARD,
  MOCK_MEMBERS,
  MOCK_TASK_DETAIL,
} from "../data/mock-data";
import BoardColumn from "../components/kanban/BoardColumn";

// ─── Filtered column ──────────────────────────────────────────────────────────

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BoardsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const filters = useUrlFilters();
  const setFilters = useSetUrlFilters();
  const resetFilters = useResetUrlFilters();
  const activeCount = useActiveFilterCount();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // TODO merge day: replace with Dev 3's hooks
  const boardState = MOCK_BOARD;
  const columns = boardState.columnOrder.map((id) => boardState.columns[id]);

  const handleCardClick = useCallback((task: Task) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setTimeout(() => {
      setActiveTask(
        MOCK_TASK_DETAIL[task.id] ?? {
          ...task,
          subtasks: [],
          comments: [],
          activityLog: [],
        },
      );
      setDrawerLoading(false);
    }, 250);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Topbar ── */}
      <header className="border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-5 flex-wrap min-h-13 py-2">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-foreground">
              Team Board
            </h1>
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
      {/* TODO merge day (Dev 1): wrap the children below with DndContext + DragOverlay */}
      <KanbanBoard
        boardState={boardState}
        onAddColumn={() => console.log("add column")}
      >
        {boardState.columnOrder.map((columnId) => (
          <BoardColumn
            key={columnId}
            columnId={columnId}
            boardState={boardState}
            onCardClick={handleCardClick}
            onAddTask={(colId) => console.log("add task to", colId)}
          />
        ))}
      </KanbanBoard>

      {/* ── Drawer ── */}
      <TaskDetailDrawer
        task={activeTask}
        columns={columns}
        members={MOCK_MEMBERS}
        currentUser={CURRENT_USER}
        isOpen={drawerOpen}
        isLoading={drawerLoading}
        onClose={() => setDrawerOpen(false)}
        onUpdatePriority={(taskId, priority) =>
          console.log("priority", taskId, priority)
        }
        onUpdateAssignee={(taskId, id) => console.log("assignee", taskId, id)}
        onUpdateDueDate={(taskId, date) => console.log("due", taskId, date)}
        onMoveToColumn={(taskId, colId) =>
          console.log("move", taskId, "→", colId)
        }
        onToggleSubtask={(subtaskId, done) =>
          console.log("subtask", subtaskId, done)
        }
        onAddSubtask={(title) => console.log("add subtask", title)}
        onDeleteSubtask={(subtaskId) => console.log("del subtask", subtaskId)}
        onAddComment={(content) => console.log("comment", content)}
      />
    </div>
  );
}
