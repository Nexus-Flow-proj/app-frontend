// features/boards/pages/BoardsPage.tsx
// Route: /projects/:id/boards
// All filters are URL-driven via useSearchParams — shareable, back-button safe.
// TODO merge day: replace MOCK_* with Dev 3's hooks (useBoardColumns, useTasksByColumn, useMoveTask).
// TODO merge day: wrap KanbanBoard children with DndContext + DragOverlay from Dev 1.

import { useState, useCallback } from "react";
import { useParams } from "react-router";
import { KanbanBoard } from "../components/KanbanBoard";
import { KanbanColumn } from "../components/KanbanColumn";
import { TaskCard } from "../components/TaskCard";
import { TaskDetailDrawer } from "../components/TaskDetailDrawer";
// import { BoardFilters } from "../components/BoardFilters";
import { BoardSearchBar } from "../components/BoardSearchBar";
import {
  useUrlFilters,
  useSetUrlFilters,
  useResetUrlFilters,
  useActiveFilterCount,
  useFilteredTaskIds,
} from "../hooks/useBoardFilters";
import type { BoardState, Task, TaskDetail, BoardMember } from "../types";

// ─── Mock data — replace with Dev 3's hooks on merge day ─────────────────────
const CURRENT_USER: BoardMember = {
  id: "u1",
  name: "Ahmed Hassan",
  avatarUrl: null,
};

const MOCK_MEMBERS: BoardMember[] = [
  { id: "u1", name: "Ahmed Hassan", avatarUrl: null },
  { id: "u2", name: "Sara Ramadan", avatarUrl: null },
  { id: "u3", name: "Karim Mostafa", avatarUrl: null },
  { id: "u4", name: "Lina Nasser", avatarUrl: null },
];

const TODAY = new Date().toISOString().slice(0, 10);

const MOCK_BOARD: BoardState = {
  columnOrder: ["col1", "col2", "col3", "col4"],
  columns: {
    col1: {
      id: "col1",
      projectId: "p1",
      title: "Backlog",
      sort_order: 1,
      taskIds: ["t1", "t2", "t3"],
      isProtected: true,
    },
    col2: {
      id: "col2",
      projectId: "p1",
      title: "In Progress",
      sort_order: 2,
      taskIds: ["t4", "t5"],
      isProtected: false,
    },
    col3: {
      id: "col3",
      projectId: "p1",
      title: "In Review",
      sort_order: 3,
      taskIds: ["t6", "t7"],
      isProtected: false,
    },
    col4: {
      id: "col4",
      projectId: "p1",
      title: "Done",
      sort_order: 4,
      taskIds: ["t8", "t9"],
      isProtected: true,
    },
  },
  tasks: {
    t1: {
      id: "t1",
      columnId: "col1",
      projectId: "p1",
      title: "Define color tokens and typography scale",
      description: "Establish all Tailwind CSS theme extensions.",
      priority: "low",
      assignee: MOCK_MEMBERS[1],
      dueDate: "2025-06-20",
      subtaskCount: 4,
      completedSubtaskCount: 1,
      commentCount: 2,
      attachmentCount: 0,
      tags: ["design"],
      createdAt: "",
      updatedAt: "",
    },
    t2: {
      id: "t2",
      columnId: "col1",
      projectId: "p1",
      title: "Set up PostgreSQL schema for projects",
      description: "",
      priority: "medium",
      assignee: MOCK_MEMBERS[2],
      dueDate: "2025-06-25",
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      attachmentCount: 1,
      tags: ["backend"],
      createdAt: "",
      updatedAt: "",
    },
    t3: {
      id: "t3",
      columnId: "col1",
      projectId: "p1",
      title: "Write onboarding docs for new members",
      description: "",
      priority: "low",
      assignee: MOCK_MEMBERS[0],
      dueDate: null,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 1,
      attachmentCount: 0,
      tags: [],
      createdAt: "",
      updatedAt: "",
    },
    t4: {
      id: "t4",
      columnId: "col2",
      projectId: "p1",
      title: "Implement HTTP-only cookie auth with CSRF interceptor",
      description:
        "Migration from in-memory Bearer tokens to HTTP-only cookies.",
      priority: "urgent",
      assignee: MOCK_MEMBERS[0],
      dueDate: TODAY,
      subtaskCount: 3,
      completedSubtaskCount: 2,
      commentCount: 5,
      attachmentCount: 0,
      tags: ["auth"],
      createdAt: "",
      updatedAt: "",
    },
    t5: {
      id: "t5",
      columnId: "col2",
      projectId: "p1",
      title: "Build Konva infinite canvas with pan, zoom and snap",
      description: "Main Workshop using react-konva.",
      priority: "high",
      assignee: MOCK_MEMBERS[1],
      dueDate: "2025-06-10",
      subtaskCount: 5,
      completedSubtaskCount: 2,
      commentCount: 3,
      attachmentCount: 0,
      tags: ["canvas"],
      createdAt: "",
      updatedAt: "",
    },
    t6: {
      id: "t6",
      columnId: "col3",
      projectId: "p1",
      title: "Login and registration forms with zod validation",
      description: "Forms complete with error states and toasts.",
      priority: "high",
      assignee: MOCK_MEMBERS[0],
      dueDate: null,
      subtaskCount: 4,
      completedSubtaskCount: 4,
      commentCount: 4,
      attachmentCount: 1,
      tags: ["auth"],
      createdAt: "",
      updatedAt: "",
    },
    t7: {
      id: "t7",
      columnId: "col3",
      projectId: "p1",
      title: "Dashboard analytics — tasks bar chart with Recharts",
      description: "",
      priority: "medium",
      assignee: MOCK_MEMBERS[3],
      dueDate: "2025-06-16",
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 2,
      attachmentCount: 0,
      tags: ["dashboard"],
      createdAt: "",
      updatedAt: "",
    },
    t8: {
      id: "t8",
      columnId: "col4",
      projectId: "p1",
      title: "Configure Vite + TypeScript + Tailwind scaffold",
      description: "",
      priority: "medium",
      assignee: MOCK_MEMBERS[0],
      dueDate: null,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      attachmentCount: 0,
      tags: ["infra"],
      createdAt: "",
      updatedAt: "",
    },
    t9: {
      id: "t9",
      columnId: "col4",
      projectId: "p1",
      title: "Set up React Router v6 with auth guard and RBAC",
      description: "",
      priority: "low",
      assignee: MOCK_MEMBERS[2],
      dueDate: null,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      attachmentCount: 0,
      tags: ["routing"],
      createdAt: "",
      updatedAt: "",
    },
  },
};

const MOCK_TASK_DETAIL: Partial<Record<string, TaskDetail>> = {
  t4: {
    ...MOCK_BOARD.tasks.t4,
    subtasks: [
      {
        id: "s1",
        taskId: "t4",
        title: "Update axios.ts — remove Bearer interceptor",
        completed: true,
        sort_order: 1,
      },
      {
        id: "s2",
        taskId: "t4",
        title: "Simplify authStore.setAuth to user only",
        completed: true,
        sort_order: 2,
      },
      {
        id: "s3",
        taskId: "t4",
        title: "Remove accessToken from authService types",
        completed: false,
        sort_order: 3,
      },
    ],
    comments: [
      {
        id: "c1",
        taskId: "t4",
        author: MOCK_MEMBERS[0],
        content: "Finished the axios interceptor. Moving to authStore now.",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: "",
      },
      {
        id: "c2",
        taskId: "t4",
        author: MOCK_MEMBERS[1],
        content: "Check header name with the backend team.",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: "",
      },
    ],
    activityLog: [
      {
        id: "a1",
        actor: MOCK_MEMBERS[0],
        action: "moved this card to In Progress",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
};

// ─── Filtered column ──────────────────────────────────────────────────────────
function BoardColumn({
  columnId,
  boardState,
  onCardClick,
  onAddTask,
}: {
  columnId: string;
  boardState: BoardState;
  onCardClick: (task: Task) => void;
  onAddTask: (colId: string) => void;
}) {
  const column = boardState.columns[columnId];
  const filters = useUrlFilters();
  const filteredIds = useFilteredTaskIds(
    column.taskIds,
    boardState.tasks,
    CURRENT_USER.id,
  );

  return (
    <KanbanColumn
      column={column}
      taskCount={filteredIds.length}
      totalTaskCount={column.taskIds.length}
      onAddTask={onAddTask}
      onRenameColumn={(id) => console.log("rename", id)}
      onDeleteColumn={(id) => console.log("delete", id)}
    >
      {filteredIds.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {Object.values(filters).some((v) => (Array.isArray(v) ? v.length : v))
            ? "No tasks match filters"
            : "No tasks yet"}
        </p>
      ) : (
        filteredIds.map((taskId) => {
          const task = boardState.tasks[taskId];
          if (!task) return null;
          return <TaskCard key={task.id} task={task} onClick={onCardClick} />;
        })
      )}
    </KanbanColumn>
  );
}

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
        <div className="flex items-center gap-2 px-5 flex-wrap min-h-[52px] py-2">
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
            {/* <BoardFilters
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
            /> */}
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
