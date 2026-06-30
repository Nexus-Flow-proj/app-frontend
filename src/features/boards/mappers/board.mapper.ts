import type { ApiBoardColumn } from "../types/api/board-api.types";
import type { BoardColumn } from "../types";

export function mapBoardColumn(
    column: ApiBoardColumn,
    projectId: string,
): BoardColumn {
    return {
        id: column.id,

        projectId,

        name: column.name,

        sortOrder: column.sortOrder,

        isProtected: column.isProtected,

        color: column.color ?? undefined,

        createdAt: column.createdAt,
    };
}