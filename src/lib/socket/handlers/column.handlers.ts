import type { QueryClient } from "@tanstack/react-query";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapBoardColumn } from "@/features/boards/mappers";
import { addColumnToCache, removeColumnFromCache, reorderColumnsInCache, updateColumnInCache } from "@/features/boards/cache/board-columns.cache";

export function registerColumnHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.COLUMN.CREATED, payload => {
        const column = mapBoardColumn(payload.column, payload.projectId);
        addColumnToCache(qc, payload.projectId, column);
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.UPDATED, payload => {
        const updatedColumn = mapBoardColumn(payload.column, payload.projectId);
        updateColumnInCache(qc, payload.projectId, payload.column.id, updatedColumn);
        console.log("COLUMN Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.COLUMN.REORDERED, payload => {
        reorderColumnsInCache(qc, payload.projectId, { columns: payload.columns });
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.DELETED, (payload) => {
        removeColumnFromCache(qc, payload.projectId, payload.columnId);
        console.log("COLUMN Event With Payload : ", payload);

    });
}