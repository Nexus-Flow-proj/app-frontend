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

export async function addOptimisticTimeLogToCache(
    qc: QueryClient,
    taskId: string,
    newTimeLog: TimeLog,
) {
    await qc.cancelQueries({ queryKey: getTimeLogsKey(taskId) });

    const previousTimeLogs = qc.getQueryData<TimeLogList>(
        getTimeLogsKey(taskId),
    );

    addTimeLogToCache(qc, taskId, newTimeLog);

    return { previousTimeLogs };
}

export function replaceTimeLogInCache(
    qc: QueryClient,
    taskId: string,
    timeLogId: string,
    replacement: TimeLog,
) {
    qc.setQueryData<TimeLogList>(
        getTimeLogsKey(taskId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                timeLogs: old.timeLogs.map((log) =>
                    log.id === timeLogId ? replacement : log,
                ),
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

export async function removeTimeLogFromCacheOptimistically(
    qc: QueryClient,
    taskId: string,
    timeLogId: string,
) {
    await qc.cancelQueries({ queryKey: getTimeLogsKey(taskId) });

    const previousTimeLogs = qc.getQueryData<TimeLogList>(
        getTimeLogsKey(taskId),
    );

    removeTimeLogFromCache(qc, taskId, timeLogId);

    return { previousTimeLogs };
}

export function rollbackTimeLogs(
    qc: QueryClient,
    taskId: string,
    previousTimeLogs: TimeLogList | undefined,
) {
    qc.setQueryData(getTimeLogsKey(taskId), previousTimeLogs);
}
