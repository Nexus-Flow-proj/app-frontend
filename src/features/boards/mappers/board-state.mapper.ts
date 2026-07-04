import type {
    BoardColumn,
    BoardState,
    Task,
} from "../types";

export function buildBoardState(
    columns: BoardColumn[],
    tasks: Task[],
): BoardState {
    const columnsMap: BoardState["columns"] = {};
    const tasksMap: BoardState["tasks"] = {};
    const columnOrder: string[] = [];

    // Build column lookup
    for (const column of columns) {
        columnsMap[column.id] = column;
        tasksMap[column.id] = [];
        columnOrder.push(column.id);
    }

    // Group tasks by their board column
    for (const task of tasks) {
        if (!task.boardColumnId) continue;

        tasksMap[task.boardColumnId]?.push(task);
    }

    return {
        columns: columnsMap,
        tasks: tasksMap,
        columnOrder,
    };
}