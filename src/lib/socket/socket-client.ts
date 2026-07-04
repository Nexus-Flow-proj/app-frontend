// src/lib/socket/socket-client.ts
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from './types/events';
import { SOCKET_URL, SOCKET_OPTIONS } from './constants/socket-config';

// Create a strongly-typed instance singleton 
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    SOCKET_URL,
    SOCKET_OPTIONS
);

// Optional development logging for engineering telemetry
if (import.meta.env.DEV) {
    socket.on('connect', () => {
        console.log(`[Socket] Connected safely. ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
        console.warn(`[Socket] Disconnected. Reason: ${reason}`);
    });

    socket.on('connect_error', (error) => {
        console.error(`[Socket] Connection error details:`, error);
    });
}