import type { Socket } from "socket.io-client";
import { socket } from "./socket-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./types/events";
import { SOCKET_EVENTS } from "./constants/socket-events";
import { SOCKET_OPTIONS, SOCKET_URL } from "./constants/socket-config";

type SocketErrorDetails = {
    message?: string;
    description?: unknown;
    type?: unknown;
    contextStatus?: unknown;
    contextResponseText?: unknown;
    transport?: unknown;
    socketUrl: string;
    socketOptions: typeof SOCKET_OPTIONS;
};

type EngineDiagnostics = {
    on(event: "packet", listener: (packet: { type: string }) => void): void;
    on(event: "upgrade_error", listener: (error: unknown) => void): void;
};

function getSocketErrorDetails(error: unknown): SocketErrorDetails {
    const details: SocketErrorDetails = {
        socketUrl: SOCKET_URL || "[same-origin]",
        socketOptions: SOCKET_OPTIONS,
    };

    if (!(error instanceof Error)) return details;

    const errorRecord = error as Error & {
        description?: unknown;
        type?: unknown;
        context?: {
            status?: unknown;
            responseText?: unknown;
            response?: unknown;
        };
        transport?: unknown;
    };

    return {
        ...details,
        message: error.message,
        description: errorRecord.description,
        type: errorRecord.type,
        contextStatus: errorRecord.context?.status,
        contextResponseText:
            errorRecord.context?.responseText ?? errorRecord.context?.response,
        transport: errorRecord.transport,
    };
}

export class SocketManager {
    private static instance: SocketManager
    private isInitialized: boolean = false;
    private activeProjectId: string | null = null;
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private constructor() {
        this.socket = socket;
    }

    public static getInstance(): SocketManager {
        if (SocketManager.instance) return SocketManager.instance;
        SocketManager.instance = new SocketManager();
        return SocketManager.instance;
    }


    initialize() {
        if (this.isInitialized) return;
        this.registerInternalListeners();
        this.isInitialized = true;
        this.connect();
        if (import.meta.env.DEV) {
            console.log("✅ SocketManager initialized (listeners ready)");
        }
    }

    private registerInternalListeners() {
        // Connect
        this.socket.on(SOCKET_EVENTS.CONNECTION.CONNECT, () => {
            console.log("✅ Connected | ID:", this.socket.id);
            if (this.activeProjectId) {
                // this.joinProject(this.activeProjectId);
            }
        });

        // Disconnect
        this.socket.on(SOCKET_EVENTS.CONNECTION.DISCONNECT, (reason) => {
            console.warn("🔌 Disconnected:", reason);
        });

        // Connect Error
        this.socket.on(SOCKET_EVENTS.CONNECTION.CONNECT_ERROR, (error) => {
            console.error("❌ Connection Error:", getSocketErrorDetails(error), error);
        });
        // Reconnect Attempt
        this.socket.io.on(SOCKET_EVENTS.CONNECTION.RECONNECT_ATTEMPT, attempt => {
            console.log("Reconnecting...", attempt);
        });
        // Reconnected
        this.socket.io.on(SOCKET_EVENTS.CONNECTION.RECONNECT, attempt => {
            console.log("Reconnected after", attempt, "attempts");
        });
        // Reconnect Failed
        this.socket.io.on(SOCKET_EVENTS.CONNECTION.RECONNECT_FAILED, () => {
            console.error("Failed to reconnect.");
        });
        const engine = this.socket.io.engine as EngineDiagnostics | undefined;
        engine?.on("packet", (packet) => {
            if (packet.type !== "error") return;
            console.error("❌ Engine.IO error packet:", packet);
        });
        engine?.on("upgrade_error", (error) => {
            console.error(
                "❌ Engine.IO upgrade error:",
                getSocketErrorDetails(error),
                error,
            );
        });



        // Optional: for debugging
        if (import.meta.env.DEV) {
            this.socket.onAny(event => {
                console.log(`📡 Event: ${event}`);
            });
        }
    }



    connect() {
        if (!this.isInitialized)
            throw new Error("You must call initialize() first")
        if (this.socket.connected || this.socket.active) return;
        this.socket.connect();
    }
    disconnect() {
        if (this.socket.disconnected) return;
        this.socket.disconnect();
    }
    destroy() {
        if (!this.isInitialized) return;
        this.disconnect();
        this.socket.removeAllListeners();
        this.socket.io.removeAllListeners();
        this.isInitialized = false;
        this.activeProjectId = null;
        if (import.meta.env.DEV) {
            console.log("SocketManager destroyed")
        }
    }

    joinProject(projectId: string) {
        if (!projectId) throw new Error("Project ID is required");
        if (this.activeProjectId === projectId) return;
        if (this.activeProjectId && this.activeProjectId !== projectId) this.leaveProject(this.activeProjectId);
        this.socket.emit(SOCKET_EVENTS.PROJECT.JOIN, { projectId });
        this.activeProjectId = projectId;
        if (import.meta.env.DEV) {
            console.log("✅ Joined project room", projectId);
        }
    }
    leaveProject(projectId: string) {
        if (!projectId) throw new Error("Project ID is required");
        if (this.activeProjectId !== projectId) return;
        this.socket.emit(SOCKET_EVENTS.PROJECT.LEAVE, { projectId });
        this.activeProjectId = null;
    }


    get isConnected(): boolean {
        return this.socket.connected;
    }
    get currentProjectId(): string | null {
        return this.activeProjectId;
    }
    get socketId(): string | undefined {
        return this.socket.id;
    }

    onConnect(listener: () => void): () => void {
        this.socket.on("connect", listener);
        return () => this.socket.off("connect", listener);
    }



    /**
     * Register a typed socket listener.
     */
    on<K extends keyof ServerToClientEvents>(event: K, listener: ServerToClientEvents[K]): () => void {
        this.socket.on(event, listener as never);
        return () => { this.socket.off(event, listener as never) };
    }
    off<K extends keyof ServerToClientEvents>(event: K, listener: ServerToClientEvents[K]): void {
        this.socket.off(event, listener as never);
    }
    once<K extends keyof ServerToClientEvents>(event: K, listener: ServerToClientEvents[K]): void {
        this.socket.once(event, listener as never)
    }
}
