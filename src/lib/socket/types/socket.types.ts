// src/lib/socket/types/socket.types.ts

export interface EventMetadata {
    eventId?: string;
    timestamp?: string;
}

export interface ProjectPayload {
    projectId: string;
}
export interface SocketManagerOptions {
    projectId?: string;
}
export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected";
