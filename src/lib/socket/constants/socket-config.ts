// src/lib/socket/constants/socket-config.ts

import type { ManagerOptions, SocketOptions } from "socket.io-client";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "";

type SocketClientOptions = Partial<ManagerOptions & SocketOptions>;
type SocketTransport = NonNullable<SocketClientOptions["transports"]>[number];

const SOCKET_TRANSPORTS = (() => {
    if (!import.meta.env.PROD) return undefined;

    const transport = import.meta.env.VITE_SOCKET_TRANSPORT;

    if (transport !== "polling" && transport !== "websocket") {
        return undefined;
    }

    return [transport] satisfies SocketTransport[];
})();

export const SOCKET_OPTIONS: SocketClientOptions = {
    withCredentials: true, // Crucial for HTTP-Only cookie parsing on handshake
    autoConnect: false,    // Controlled lifecycle connection within RealtimeProvider
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    ...(SOCKET_TRANSPORTS ? { transports: SOCKET_TRANSPORTS } : {}),
};
