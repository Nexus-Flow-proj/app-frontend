import { registerAllHandlers } from "@/lib/socket/handlers";
import { SocketManager } from "@/lib/socket/socket-manager";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

interface RealTimeProviderProps {
    children: ReactNode;
}

export default function RealTimeProvider({ children }: RealTimeProviderProps) {
    const qc = useQueryClient();
    const socketManager: SocketManager = SocketManager.getInstance()

    useEffect(() => {
        socketManager.initialize();
        registerAllHandlers(socketManager, qc);
        return () => {
            socketManager.destroy();
        }
    }, [socketManager, qc]);
    return (
        <>{children}</>
    )
}