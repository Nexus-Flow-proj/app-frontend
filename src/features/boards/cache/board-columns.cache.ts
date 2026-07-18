import type { QueryClient } from "@tanstack/react-query";
import type { BoardColumn } from "../types";
import type {
    ReorderBoardColumnsDto,
    UpdateBoardColumnDto,
} from "../types/api/board-api.types";
import { QUERY_KEYS } from "@/constants";

// ── Helpers ──────────────────────────────────────────────────────────

function getColumnsKey(projectId: string) {
    return QUERY_KEYS.boards.columns(projectId);
}

// ── Add ──────────────────────────────────────────────────────────────

export function addColumnToCache(
    qc: QueryClient,
    projectId: string,
    column: BoardColumn,
) {
    qc.setQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
        (old = []) => [...old, column],
    );
}

export async function addOptimisticColumnToCache(
    qc: QueryClient,
    projectId: string,
    column: BoardColumn,
) {
    await qc.cancelQueries({ queryKey: getColumnsKey(projectId) });

    const previousColumns = qc.getQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
    );

    addColumnToCache(qc, projectId, column);

    return { previousColumns };
}

// ── Remove (optimistic) ─────────────────────────────────────────────

export async function removeColumnFromCache(
    qc: QueryClient,
    projectId: string,
    columnId: string,
) {
    await qc.cancelQueries({ queryKey: getColumnsKey(projectId) });

    const previousColumns: BoardColumn[] | undefined = qc.getQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
    );

    qc.setQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
        (old = []) => old.filter((col) => col.id !== columnId),
    );

    return { previousColumns };
}

// ── Update (optimistic) ─────────────────────────────────────────────

export async function updateColumnInCache(
    qc: QueryClient,
    projectId: string,
    columnId: string,
    dto: UpdateBoardColumnDto,
) {
    await qc.cancelQueries({ queryKey: getColumnsKey(projectId) });

    const previousColumns: BoardColumn[] | undefined = qc.getQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
    );

    qc.setQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
        (old = []) => {
            const nextColumns = old.map((column) =>
                column.id === columnId
                    ? { ...column, ...dto }
                    : column,
            );

            return dto.sortOrder === undefined
                ? nextColumns
                : nextColumns.sort((a, b) => a.sortOrder - b.sortOrder);
        },
    );

    return { previousColumns };
}

export function replaceColumnInCache(
    qc: QueryClient,
    projectId: string,
    column: BoardColumn,
    targetColumnId = column.id,
) {
    qc.setQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
        (old = []) =>
            old.map((col) =>
                col.id === targetColumnId ? column : col,
            ).sort((a, b) => a.sortOrder - b.sortOrder),
    );
}

// ── Reorder (optimistic) ────────────────────────────────────────────

export async function reorderColumnsInCache(
    qc: QueryClient,
    projectId: string,
    dto: ReorderBoardColumnsDto,
) {
    await qc.cancelQueries({ queryKey: getColumnsKey(projectId) });

    const previousColumns = qc.getQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
    );

    qc.setQueryData<BoardColumn[]>(
        getColumnsKey(projectId),
        (old = []) => {
            return [...old]
                .map((column) => {
                    const updated = dto.columns.find(
                        (c) => c.id === column.id,
                    );

                    if (!updated) return column;

                    return {
                        ...column,
                        sortOrder: updated.sortOrder,
                    };
                })
                .sort((a, b) => a.sortOrder - b.sortOrder);
        },
    );

    return { previousColumns };
}

export function reconcileReorderedColumns(
    qc: QueryClient,
    projectId: string,
    columns: BoardColumn[],
) {
    qc.setQueryData(
        getColumnsKey(projectId),
        columns,
    );
}

// ── Rollback ────────────────────────────────────────────────────────

export function rollbackColumns(
    qc: QueryClient,
    projectId: string,
    previousColumns: BoardColumn[] | undefined,
) {
    qc.setQueryData(getColumnsKey(projectId), previousColumns);
}
