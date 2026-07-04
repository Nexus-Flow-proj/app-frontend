import { QUERY_KEYS } from "@/constants";
import type { QueryClient } from "@tanstack/react-query";
import type { ProjectMemberSummary } from "../types";

function getMembersKey(projectId: string) {
    return QUERY_KEYS.projects.members(projectId);
}

export function markUserOnline(qc: QueryClient, projectId: string, userId: string) {
    qc.setQueryData<ProjectMemberSummary[]>(getMembersKey(projectId), (data) => {
        if (!data) return data;
        return data.map((member) =>
            member.id === userId ? { ...member, isOnline: true } : member
        );
    });
}

export function markUserOffline(qc: QueryClient, projectId: string, userId: string) {
    qc.setQueryData<ProjectMemberSummary[]>(getMembersKey(projectId), (data) => {
        if (!data) return data;
        return data.map((member) =>
            member.id === userId ? { ...member, isOnline: false } : member
        );
    });
}
