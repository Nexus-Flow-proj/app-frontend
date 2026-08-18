import { registerAllHandlers } from "@/lib/socket/handlers";
import { SocketManager } from "@/lib/socket/socket-manager";
import { useAuthStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

interface RealTimeProviderProps {
    children: ReactNode;
}

export default function RealTimeProvider({ children }: RealTimeProviderProps) {
    const qc = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const socketManager: SocketManager = SocketManager.getInstance()

    useEffect(() => {
        if (!isAuthenticated) {
            socketManager.destroy();
            return;
        }

        socketManager.initialize();
        registerAllHandlers(socketManager, qc);
        return () => {
            socketManager.destroy();
        }
    }, [isAuthenticated, socketManager, qc]);
    return (
        <>{children}</>
    )
}
