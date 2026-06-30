import { registerAllHandlers } from "@/lib/socket/handlers";
import { SocketManager } from "@/lib/socket/socket-manager";
import { useEffect, type ReactNode } from "react";

interface RealTimeProviderProps {
    children: ReactNode;
}

export default function RealTimeProvider({ children }: RealTimeProviderProps) {
    const socketManager: SocketManager = SocketManager.getInstance()

    useEffect(() => {
        socketManager.initialize();
        registerAllHandlers(socketManager);
        return () => {
            socketManager.destroy();
        }
    }, [socketManager]);
    return (
        <>{children}</>
    )
}