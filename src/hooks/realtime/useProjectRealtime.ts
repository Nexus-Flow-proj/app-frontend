import { SocketManager } from "@/lib/socket/socket-manager";
import { useEffect } from "react";

const socketManager: SocketManager = SocketManager.getInstance();

/**
 * Joins the project's Socket.IO room while mounted
 * and automatically leaves it during cleanup or
 * when the project changes.
 */
export const useProjectRealTime = (projectId: string) => {
    useEffect(() => {
        if (!projectId) return;
        socketManager.joinProject(projectId);
        return () => {
            socketManager.leaveProject(projectId);
        }
    }, [projectId]);
};