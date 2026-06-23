// features/boards/pages/BoardsPage.tsx
// Route: /projects/:id/boards
// All filters are URL-driven via useSearchParams — shareable, back-button safe.
// TODO merge day: replace MOCK_* with Dev 3's hooks (useBoardColumns, useTasksByColumn, useMoveTask).
// TODO merge day: wrap KanbanBoard children with DndContext + DragOverlay from Dev 1.

 import { useState } from "react";
 import { useParams } from "react-router";
 import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
 import { Plus } from "lucide-react";
 
 import { KanbanBoard } from "../components/kanban/KanbanBoard";
 import { TaskDetailDrawer } from "../components/drawers/TaskDetailDrawer";
 import { BoardFilters } from "../components/Topbar/BoardFilters";
 import { BoardSearchBar } from "../components/Topbar/BoardSearchBar";
 import { AddTaskDialog } from "../components/kanban/AddTaskDialog";
 import { AddColumnDialog } from "../components/kanban/AddColumnDialog";
 import {
   useUrlFilters,
   useSetUrlFilters,
   useResetUrlFilters,
   useActiveFilterCount,
 } from "../hooks/useBoardFilters";
 import { useBoardDnd } from "../hooks/useBoardDnd";
 import { useBoardColumns } from "../hooks/useBoardColumns";
 import { useTaskDetail } from "../hooks/useTaskDetail";
 import type { Task } from "../types";
 import { CURRENT_USER, MOCK_BOARD, MOCK_MEMBERS } from "../data/mock-data";
 import KanbanBoardColumn from "../components/kanban/kanbanboard-column";
 import TaskCard from "../components/kanban/task-card";
 
 function BoardsPage() {
   const { id: projectId } = useParams<{ id: string }>();
 
   const filters = useUrlFilters();
   const setFilters = useSetUrlFilters();
   const resetFilters = useResetUrlFilters();
   const activeCount = useActiveFilterCount();
 
   const [boardState, setBoardState] = useState(MOCK_BOARD);
   const columns = boardState.columnOrder.map((id) => boardState.columns[id]);
 
   const drawer = useTaskDetail({
     projectId: projectId ?? "p1",
     setBoardState,
   });
 
   const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
 
   const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
   const isAddTaskOpen = addTaskColumnId !== null;
 
   const { handleAddColumn, handleAddTask } = useBoardColumns({
     boardState,
     setBoardState,
     projectId,
     currentUser: CURRENT_USER,
     onTaskAdded: (task: Task) => drawer.openDrawer(task),
   });
 
   const boardDnd = useBoardDnd({
     boardState,
     setBoardState,
     onMoveTask: (taskId, sourceColId, targetColId, newPositionFloat) =>
       console.log("move task", { taskId, sourceColId, targetColId, newPositionFloat }),
     onMoveColumn: (columnId, newPositionFloat) =>
       console.log("move column", { columnId, newPositionFloat }),
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
               onClick={() => setIsAddColumnOpen(true)}
             >
               <Plus className="size-3.5" /> Add column
             </button>
           </div>
         </div>
       </header>
 
       <DndContext
         sensors={boardDnd.sensors}
         collisionDetection={closestCorners}
         onDragStart={boardDnd.handleDragStart}
         onDragEnd={boardDnd.handleDragEnd}
       >
         <KanbanBoard boardState={boardState} onAddColumn={() => setIsAddColumnOpen(true)}>
           {boardState.columnOrder.map((columnId) => (
             <KanbanBoardColumn
               key={columnId}
               columnId={columnId}
               boardState={boardState}
               onCardClick={handleCardClick}
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
         {...drawer.drawerProps}
         columns={columns}
         members={MOCK_MEMBERS}
         currentUser={CURRENT_USER}
       />
     </div>
   );
 }
 
 export default BoardsPage;
 