import type { Socket } from "socket.io-client";
import { socket } from "./socket-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./types/events";
import { SOCKET_EVENTS } from "./constants/socket-events";
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
        this.connect();
        this.isInitialized = true;
        if (import.meta.env.DEV) {
            console.log("✅ SocketManager initialized (listeners ready)");
        }
    }

    private registerInternalListeners() {
        // Connect
        this.socket.on(SOCKET_EVENTS.CONNECTION.CONNECT, () => {
            console.log("✅ Connected | ID:", this.socket.id);
            if (this.activeProjectId) {
                this.joinProject(this.activeProjectId);
            }
        });

        // Disconnect
        this.socket.on(SOCKET_EVENTS.CONNECTION.DISCONNECT, (reason) => {
            console.warn("🔌 Disconnected:", reason);
        });

        // Connect Error
        this.socket.on(SOCKET_EVENTS.CONNECTION.CONNECT_ERROR, (error) => {
            console.error("❌ Connection Error:", error);
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
        if (this.socket.connected) return;
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

