import { useUrlFilters, useFilteredTaskIds } from "../../hooks/useBoardFilters";
import type { BoardState, Task } from "../../types";
import { CURRENT_USER } from "../../data/mock-data";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

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
  console.log(column);
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

export default BoardColumn;
