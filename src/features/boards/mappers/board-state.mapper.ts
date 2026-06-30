import type {
    ApiBoardColumn,
    ApiTaskSummary,
} from "../types/api/board-api.types";

import type { BoardState } from "../types";

import { mapBoardColumn } from "./board.mapper";
import { mapTaskSummary } from "./task.mapper";

export function buildBoardState(
    apiColumns: ApiBoardColumn[],
    apiTasks: ApiTaskSummary[],
    projectId: string,
): BoardState {
    const columns: BoardState["columns"] = {};

    const tasks: BoardState["tasks"] = {};

    const columnOrder: string[] = [];

    // Build columns
    for (const column of apiColumns) {
        const mappedColumn = mapBoardColumn(column, projectId);
        columns[mappedColumn.id] = mappedColumn;
        tasks[mappedColumn.id] = [];
        columnOrder.push(mappedColumn.id);
    }
    // Group tasks by column
    for (const task of apiTasks) {
        const mappedTask = mapTaskSummary(task);
        const columnId = mappedTask.boardColumnId;
        if (!columnId) continue;
        tasks[columnId]?.push(mappedTask);
    }
    return {
        columns,
        tasks,
        columnOrder,
    };
}