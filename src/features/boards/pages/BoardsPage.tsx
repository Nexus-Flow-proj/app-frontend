// features/boards/pages/BoardsPage.tsx
// Route: /projects/:id/boards
// This is the assembly page — Dev 2 + Dev 4 outputs wired together.
// Dev 1's DndContext + SortableContext wraps KanbanBoard (plug in on merge day).
// Dev 3's hooks replace the mock data below (plug in on merge day).

import { useState, useCallback } from "react";
import { useParams } from "react-router";
import { KanbanBoard } from "../components/KanbanBoard";
import { KanbanColumn } from "../components/KanbanColumn";
import { TaskCard } from "../components/TaskCard";
import { TaskDetailDrawer } from "../components/TaskDetailDrawer";
import { BoardFilters } from "../components/BoardFilters";
import { BoardSearchBar } from "../components/BoardSearchBar";
import {
  useBoardFilterStore,
  useFilteredTaskIds,
} from "../hooks/useBoardFilters";
import type {
  BoardMember,
  BoardState,
  Task,
  TaskDetail,
} from "../types/types.index (1)";

// ─── Mock data (replace with Dev 3's hooks on merge day) ─────────────────────
const MOCK_CURRENT_USER: BoardMember = {
  id: "user-1",
  name: "Ahmed Hassan",
  avatarUrl: null,
};

const MOCK_MEMBERS: BoardMember[] = [
  { id: "user-1", name: "Ahmed Hassan", avatarUrl: null },
  { id: "user-2", name: "Sara Ramadan", avatarUrl: null },
  { id: "user-3", name: "Karim Mostafa", avatarUrl: null },
];

const MOCK_BOARD_STATE: BoardState = {
  columnOrder: ["col-1", "col-2", "col-3", "col-4"],
  columns: {
    "col-1": {
      id: "col-1",
      projectId: "proj-1",
      title: "Backlog",
      sort_order: 1,
      taskIds: ["t1", "t2", "t3"],
      isProtected: true,
    },
    "col-2": {
      id: "col-2",
      projectId: "proj-1",
      title: "In Progress",
      sort_order: 2,
      taskIds: ["t4", "t5"],
      isProtected: false,
    },
    "col-3": {
      id: "col-3",
      projectId: "proj-1",
      title: "In Review",
      sort_order: 3,
      taskIds: ["t6"],
      isProtected: false,
    },
    "col-4": {
      id: "col-4",
      projectId: "proj-1",
      title: "Done",
      sort_order: 4,
      taskIds: ["t7"],
      isProtected: true,
    },
  },
  tasks: {
    t1: {
      id: "t1",
      columnId: "col-1",
      projectId: "proj-1",
      title: "Define color tokens and typography scale",
      description: "Establish all Tailwind CSS theme extensions.",
      priority: "low",
      sort_order: 1,
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
      columnId: "col-1",
      projectId: "proj-1",
      title: "Set up PostgreSQL schema for projects and tasks",
      description: "",
      priority: "medium",
      sort_order: 2,
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
      columnId: "col-1",
      projectId: "proj-1",
      title: "Write onboarding docs for new team members",
      description: "",
      priority: "low",
      sort_order: 3,
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
      columnId: "col-2",
      projectId: "proj-1",
      title: "Implement HTTP-only cookie auth with CSRF token interceptor",
      description:
        "Migration from in-memory Bearer tokens to HTTP-only cookies.",
      priority: "urgent",
      sort_order: 1,
      assignee: MOCK_MEMBERS[0],
      dueDate: new Date().toISOString().slice(0, 10),
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
      columnId: "col-2",
      projectId: "proj-1",
      title: "Build Konva infinite canvas with pan, zoom, and snap-to-grid",
      description: "Main Workshop canvas using react-konva.",
      priority: "high",
      sort_order: 2,
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
      columnId: "col-3",
      projectId: "proj-1",
      title: "Login and registration forms with zod validation",
      description: "",
      priority: "high",
      sort_order: 1,
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
      columnId: "col-4",
      projectId: "proj-1",
      title: "Configure Vite + TypeScript + Tailwind project scaffold",
      description: "",
      priority: "medium",
      sort_order: 1,
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
  },
};

const MOCK_TASK_DETAIL: Record<string, TaskDetail> = {
  t4: {
    ...MOCK_BOARD_STATE.tasks.t4,
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
        content:
          "Check if backend expects X-XSRF-TOKEN or X-CSRF-Token header specifically.",
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

// ─── Column wrapper that applies filters ──────────────────────────────────────
function FilteredColumn({
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
  const filteredIds = useFilteredTaskIds(
    column.taskIds,
    boardState.tasks,
    MOCK_CURRENT_USER.id,
  );

  return (
    <KanbanColumn
      column={column}
      taskCount={filteredIds.length}
      onAddTask={onAddTask}
      onRenameColumn={(id) => console.log("rename", id)}
      onDeleteColumn={(id) => console.log("delete", id)}
    >
      {filteredIds.map((taskId) => {
        const task = boardState.tasks[taskId];
        if (!task) return null;
        return <TaskCard key={task.id} task={task} onClick={onCardClick} />;
      })}
    </KanbanColumn>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BoardsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { filters, setFilter, resetFilters } = useBoardFilterStore();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // TODO (merge day): Replace MOCK_BOARD_STATE with Dev 3's useBoardColumns + useTasksByColumn
  const boardState = MOCK_BOARD_STATE;
  const columns = boardState.columnOrder.map((id) => boardState.columns[id]);

  const handleCardClick = useCallback((task: Task) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    // TODO (merge day): replace with useTaskDetail(task.id) from Dev 3
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
    }, 300);
  }, []);

  const handleAddTask = useCallback((columnId: string) => {
    // TODO: open quick-create modal / inline input
    console.log("Add task to column", columnId);
  }, []);

  // TODO (merge day): wire to Dev 3's useMoveTask mutation
  const handleMoveToColumn = useCallback((taskId: string, columnId: string) => {
    console.log("Move", taskId, "→", columnId);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0e0e1a] overflow-hidden">
      {/* ── Top bar ── */}
      <div className="h-14 border-b border-white/6 flex items-center px-6 gap-3 shrink-0">
        <div>
          <span className="text-sm font-semibold text-zinc-100">
            Team Board
          </span>
          <span className="text-xs text-zinc-600 ml-2">— {projectId}</span>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <BoardSearchBar
            value={filters.search}
            onChange={(search) => setFilter({ search })}
          />
          <BoardFilters
            filters={filters}
            members={MOCK_MEMBERS}
            currentUserId={MOCK_CURRENT_USER.id}
            onChange={setFilter}
            onReset={resetFilters}
          />
          <button className="h-8 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
            + Add column
          </button>
        </div>
      </div>

      {/* ── Board ── */}
      {/* TODO (merge day — Dev 1): Wrap KanbanBoard with DndContext + DragOverlay here */}
      <KanbanBoard
        boardState={boardState}
        onAddColumn={() => console.log("add column")}
      >
        {boardState.columnOrder.map((columnId) => (
          <FilteredColumn
            key={columnId}
            columnId={columnId}
            boardState={boardState}
            onCardClick={handleCardClick}
            onAddTask={handleAddTask}
          />
        ))}
      </KanbanBoard>

      {/* ── Task detail drawer ── */}
      <TaskDetailDrawer
        task={activeTask}
        columns={columns}
        members={MOCK_MEMBERS}
        currentUser={MOCK_CURRENT_USER}
        isOpen={drawerOpen}
        isLoading={drawerLoading}
        onClose={() => setDrawerOpen(false)}
        onUpdatePriority={(taskId, priority) =>
          console.log("priority", taskId, priority)
        }
        onUpdateAssignee={(taskId, assigneeId) =>
          console.log("assignee", taskId, assigneeId)
        }
        onUpdateDueDate={(taskId, dueDate) =>
          console.log("due", taskId, dueDate)
        }
        onMoveToColumn={handleMoveToColumn}
        onToggleSubtask={(subtaskId, completed) =>
          console.log("subtask", subtaskId, completed)
        }
        onAddSubtask={(title) => console.log("add subtask", title)}
        onDeleteSubtask={(subtaskId) =>
          console.log("delete subtask", subtaskId)
        }
        onAddComment={(content) => console.log("comment", content)}
      />
    </div>
  );
}
