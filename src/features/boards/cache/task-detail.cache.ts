import type { QueryClient } from "@tanstack/react-query";
import type { Comment, Subtask, TaskDetail } from "../types";
import { QUERY_KEYS } from "@/constants";

// ── Helpers ──────────────────────────────────────────────────────────

function getDetailKey(taskId: string) {
    return QUERY_KEYS.tasks.detail(taskId);
}

// ── Task Detail ─────────────────────────────────────────────────────

export async function snapshotTaskDetail(
    qc: QueryClient,
    taskId: string,
) {
    await qc.cancelQueries({ queryKey: getDetailKey(taskId) });

    return qc.getQueryData<TaskDetail>(getDetailKey(taskId));
}

export function updateTaskDetailCache(
    qc: QueryClient,
    taskId: string,
    updater: (old: TaskDetail) => TaskDetail,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;
            return updater(old);
        },
    );
}

export function rollbackTaskDetail(
    qc: QueryClient,
    taskId: string,
    previousTaskDetail: TaskDetail | undefined,
) {
    qc.setQueryData(getDetailKey(taskId), previousTaskDetail);
}

export function removeTaskDetailCache(
    qc: QueryClient,
    taskId: string,
) {
    qc.removeQueries({ queryKey: getDetailKey(taskId) });
}

export function invalidateTaskDetail(
    qc: QueryClient,
    taskId: string,
) {
    qc.invalidateQueries({ queryKey: getDetailKey(taskId) });
}

// ── Comments ────────────────────────────────────────────────────────

export function addCommentToCache(
    qc: QueryClient,
    taskId: string,
    newComment: Comment,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;
            const existed = old.comments.some(comment => comment.id === newComment.id)
            if (existed) return;
            return {
                ...old,
                comments: [...old.comments, newComment],
                commentsCount: (old.commentsCount ?? old.comments.length) + 1,
            };
        },
    );
}

export async function removeCommentFromCache(
    qc: QueryClient,
    taskId: string,
    commentId: string,
) {
    await qc.cancelQueries({ queryKey: getDetailKey(taskId) });

    const previousTask = qc.getQueryData<TaskDetail>(
        getDetailKey(taskId),
    );

    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;
            return {
                ...old,
                comments: old.comments.filter(
                    (comment) => comment.id !== commentId,
                ),
                commentsCount: Math.max(
                    (old.commentsCount ?? old.comments.length) - 1,
                    0,
                ),
            };
        },
    );

    return { previousTask };
}

export function updateCommentInCache(
    qc: QueryClient,
    taskId: string,
    updatedComment: Comment,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                comments: old.comments.map((comment) =>
                    comment.id === updatedComment.id
                        ? updatedComment
                        : comment,
                ),
            };
        },
    );
}

// ── Subtasks ────────────────────────────────────────────────────────

export function addSubtaskToCache(
    qc: QueryClient,
    taskId: string,
    newSubtask: Subtask,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;
            const existed = old.subtasks.some(subtask => subtask.id === newSubtask.id)
            if (existed) return;
            return {
                ...old,
                subtasks: [...old.subtasks, newSubtask],
                subtasksCount: (old.subtasksCount ?? old.subtasks.length) + 1,
                completedSubtasksCount:
                    (old.completedSubtasksCount ??
                        old.subtasks.filter((subtask) => subtask.completed)
                            .length) + Number(newSubtask.completed),
            };
        },
    );
}

export async function removeSubtaskFromCache(
    qc: QueryClient,
    taskId: string,
    subtaskId: string,
) {
    await qc.cancelQueries({ queryKey: getDetailKey(taskId) });

    const previousTask = qc.getQueryData<TaskDetail>(
        getDetailKey(taskId),
    );

    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;

            const deletedSubtask = old.subtasks.find(
                (subtask) => subtask.id === subtaskId,

            );
            return {
                ...old,
                subtasks: old.subtasks.filter(
                    (subtask) => subtask.id !== subtaskId,
                ),

                subtasksCount: Math.max(
                    (old.subtasksCount ?? old.subtasks.length) - 1,
                    0,
                ),
                completedSubtasksCount: deletedSubtask?.completed
                    ? Math.max(
                        (old.completedSubtasksCount ??
                            old.subtasks.filter((subtask) => subtask.completed)
                                .length) - 1,
                        0,
                    )
                    : (old.completedSubtasksCount ??
                        old.subtasks.filter((subtask) => subtask.completed)
                            .length),
            };
        },
    );

    return { previousTask };
}

export function updateSubtaskInCache(
    qc: QueryClient,
    taskId: string,
    updatedSubtask: Subtask,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;
            const previous = old.subtasks.find(
                (subtask) => subtask.id === updatedSubtask.id,
            );

            if (!previous) return old;

            let completed = old.completedSubtasksCount ?? old.subtasks.filter(
                (subtask) => subtask.completed,
            ).length;

            if (!previous.completed && updatedSubtask.completed) {
                completed++;
            }

            if (previous.completed && !updatedSubtask.completed) {
                completed--;
            }

            return {
                ...old,
                subtasks: old.subtasks.map((subtask) =>
                    subtask.id === updatedSubtask.id
                        ? updatedSubtask
                        : subtask,
                ),
                completedSubtasksCount: completed,
            };
        },
    );
}
