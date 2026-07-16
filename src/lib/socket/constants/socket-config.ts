// src/lib/socket/constants/socket-config.ts

// export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";
export const SOCKET_URL = "https://app-backend-production-0e00.up.railway.app";

export const SOCKET_OPTIONS = {
    withCredentials: true, // Crucial for HTTP-Only cookie parsing on handshake
    autoConnect: false,    // Controlled lifecycle connection within RealtimeProvider
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    // transports: ["websocket"]
} as const;