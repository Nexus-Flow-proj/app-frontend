import { SocketManager } from "@/lib/socket/socket-manager";
import { useEffect, type ReactNode } from "react";

interface RealTimeProviderProps {
    children: ReactNode;
}
export default function RealTimeProvider({ children }: RealTimeProviderProps) {
    const socketManager = SocketManager.getInstance();

    useEffect(() => {
        socketManager.initialize();
        socketManager.connect();
        return () => {
            socketManager.destroy();
        }
    })

    return (
        <>{children}</>
    )
}