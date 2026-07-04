// hooks/realtime/useProjectPresence.ts


import { useMemo } from "react";
import { useProjectMembers } from "@/features/project/hooks/useProjectMembers";
import type { ProjectMemberSummary } from "@/features/project/types";

interface UseProjectPresenceResult {
    members: ProjectMemberSummary[];
    onlineMembers: ProjectMemberSummary[];
    offlineMembers: ProjectMemberSummary[];
    onlineCount: number;
}

export function useProjectPresence(
    projectId: string,
): UseProjectPresenceResult {
    const { data: members = [] } = useProjectMembers(projectId);

    const onlineMembers = useMemo(
        () =>
            members.filter(
                member => member.isOnline,
            ),
        [members],
    );

    const offlineMembers = useMemo(
        () =>
            members.filter(
                member => !member.isOnline,
            ),
        [members],
    );

    return {
        members,
        onlineMembers,
        offlineMembers,
        onlineCount: onlineMembers.length,
    };
}