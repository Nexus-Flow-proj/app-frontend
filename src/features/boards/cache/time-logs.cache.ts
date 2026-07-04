import type { QueryClient } from "@tanstack/react-query";
import type { TimeLog, TimeLogList } from "../types";
import { QUERY_KEYS } from "@/constants";

// ── Helpers ──────────────────────────────────────────────────────────

function getTimeLogsKey(taskId: string) {
    return QUERY_KEYS.tasks.timeLogs(taskId);
}

// ── Add ──────────────────────────────────────────────────────────────

export function addTimeLogToCache(
    qc: QueryClient,
    taskId: string,
    newTimeLog: TimeLog,
) {
    qc.setQueryData<TimeLogList>(
        getTimeLogsKey(taskId),
        (old) => {
            if (!old) return old;
            return {
                ...old,
                timeLogs: [...old.timeLogs, newTimeLog],
                total: old.total + 1,
            };
        },
    );
}

// ── Remove ──────────────────────────────────────────────────────────

export function removeTimeLogFromCache(
    qc: QueryClient,
    taskId: string,
    timeLogId: string,
) {
    qc.setQueryData<TimeLogList>(
        getTimeLogsKey(taskId),
        (old) => {
            if (!old) return;

            return {
                ...old,
                timeLogs: old.timeLogs.filter(
                    (log) => log.id !== timeLogId,
                ),
                total: Math.max(old.total - 1, 0),
            };
        },
    );
}
