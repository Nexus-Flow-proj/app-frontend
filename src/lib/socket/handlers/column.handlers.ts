import type { QueryClient } from "@tanstack/react-query";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapBoardColumn } from "@/features/boards/mappers";
import { addColumnToCache, removeColumnFromCache, reorderColumnsInCache, updateColumnInCache } from "@/features/boards/cache/board-columns.cache";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";
import { useKanbanStore } from "@/store/kanbanStore";

const REALTIME_EXIT_MS = 220;
const REALTIME_MOVE_MS = 760;

type RealtimeColumnOrder = {
    id: string;
    sortOrder: number;
};

function reorderVisibleColumns(columns: RealtimeColumnOrder[]) {
    const sortOrderById = new Map(
        columns.map((column) => [column.id, column.sortOrder]),
    );

    useKanbanStore.getState().setBoardState((current) => {
        const nextColumns = { ...current.columns };

        sortOrderById.forEach((sortOrder, columnId) => {
            const column = nextColumns[columnId];
            if (!column) return;

            nextColumns[columnId] = {
                ...column,
                sortOrder,
            };
        });

        const nextColumnOrder = [...current.columnOrder].sort((a, b) => {
            const leftOrder = nextColumns[a]?.sortOrder ?? 0;
            const rightOrder = nextColumns[b]?.sortOrder ?? 0;
            return leftOrder - rightOrder;
        });

        return {
            ...current,
            columns: nextColumns,
            columnOrder: nextColumnOrder,
        };
    });
}

function getVisibleColumnSortOrder(columnId: string) {
    return useKanbanStore.getState().boardState.columns[columnId]?.sortOrder;
}

function animateVisibleColumnReorder(columns: RealtimeColumnOrder[]) {
    const highlightStore = useHighlightStore.getState();

    highlightStore.captureVisibleLayouts(HighlightEntity.column);
    columns.forEach((column) => {
        highlightStore.markMoving(HighlightEntity.column, column.id, REALTIME_MOVE_MS);
    });

    reorderVisibleColumns(columns);
    highlightStore.animateCapturedLayouts(HighlightEntity.column, {
        duration: REALTIME_MOVE_MS,
        maxFrames: 30,
    });
}

export function registerColumnHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.COLUMN.CREATED, payload => {
        const column = mapBoardColumn(payload.column, payload.projectId);
        useHighlightStore
            .getState()
            .highlight(HighlightEntity.column, column.id, 900);
        addColumnToCache(qc, payload.projectId, column);
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.UPDATED, async payload => {
        const updatedColumn = mapBoardColumn(payload.column, payload.projectId);
        const previousSortOrder = getVisibleColumnSortOrder(updatedColumn.id);
        const sortOrderChanged =
            typeof updatedColumn.sortOrder === "number" &&
            previousSortOrder !== undefined &&
            previousSortOrder !== updatedColumn.sortOrder;

        if (sortOrderChanged) {
            animateVisibleColumnReorder([
                {
                    id: updatedColumn.id,
                    sortOrder: updatedColumn.sortOrder,
                },
            ]);
        }

        await updateColumnInCache(qc, payload.projectId, payload.column.id, updatedColumn);
        console.log("COLUMN Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.COLUMN.REORDERED, async payload => {
        const columns = payload.columns as RealtimeColumnOrder[];

        animateVisibleColumnReorder(columns);
        await reorderColumnsInCache(qc, payload.projectId, { columns: payload.columns });
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.DELETED, (payload) => {
        useHighlightStore
            .getState()
            .markRemoving(HighlightEntity.column, payload.columnId, REALTIME_EXIT_MS + 80);
        setTimeout(() => {
            removeColumnFromCache(qc, payload.projectId, payload.columnId);
        }, REALTIME_EXIT_MS);
        console.log("COLUMN Event With Payload : ", payload);

    });
}
