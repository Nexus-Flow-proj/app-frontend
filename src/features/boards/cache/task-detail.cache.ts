import type { QueryClient } from "@tanstack/react-query";
import type { Comment, Subtask, TaskDetail } from "../types";
import { QUERY_KEYS } from "@/constants";

// ── Helpers ──────────────────────────────────────────────────────────

function getDetailKey(taskId: string) {
    return QUERY_KEYS.tasks.detail(taskId);
}

function isOptimisticId(id: string) {
    return id.startsWith("temp-");
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
            const existed = old.comments.some(comment => comment.id === newComment.id);
            if (existed) return old;
            const optimisticComment = old.comments.find(
                (comment) =>
                    isOptimisticId(comment.id) &&
                    comment.content === newComment.content,
            );

            if (optimisticComment) {
                return {
                    ...old,
                    comments: old.comments.map((comment) =>
                        comment.id === optimisticComment.id
                            ? newComment
                            : comment,
                    ),
                };
            }

            return {
                ...old,
                comments: [...old.comments, newComment],
                commentsCount: (old.commentsCount ?? old.comments.length) + 1,
            };
        },
    );
}

export async function addOptimisticCommentToCache(
    qc: QueryClient,
    taskId: string,
    newComment: Comment,
) {
    await qc.cancelQueries({ queryKey: getDetailKey(taskId) });

    const previousTask = qc.getQueryData<TaskDetail>(
        getDetailKey(taskId),
    );

    addCommentToCache(qc, taskId, newComment);

    return { previousTask };
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
    targetCommentId = updatedComment.id,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                comments: old.comments.map((comment) =>
                    comment.id === targetCommentId
                        ? updatedComment
                        : comment,
                ),
            };
        },
    );
}

export async function updateCommentInCacheOptimistically(
    qc: QueryClient,
    taskId: string,
    commentId: string,
    content: string,
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
                comments: old.comments.map((comment) =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            content,
                            updatedAt: new Date().toISOString(),
                        }
                        : comment,
                ),
            };
        },
    );

    return { previousTask };
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
            const existed = old.subtasks.some(subtask => subtask.id === newSubtask.id);
            if (existed) return old;
            const optimisticSubtask = old.subtasks.find(
                (subtask) =>
                    isOptimisticId(subtask.id) &&
                    subtask.title === newSubtask.title,
            );

            if (optimisticSubtask) {
                const completedSubtasksCount =
                    old.completedSubtasksCount ??
                    old.subtasks.filter((subtask) => subtask.completed).length;

                return {
                    ...old,
                    subtasks: old.subtasks.map((subtask) =>
                        subtask.id === optimisticSubtask.id
                            ? newSubtask
                            : subtask,
                    ),
                    completedSubtasksCount:
                        completedSubtasksCount -
                        Number(optimisticSubtask.completed) +
                        Number(newSubtask.completed),
                };
            }

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

export async function addOptimisticSubtaskToCache(
    qc: QueryClient,
    taskId: string,
    newSubtask: Subtask,
) {
    await qc.cancelQueries({ queryKey: getDetailKey(taskId) });

    const previousTask = qc.getQueryData<TaskDetail>(
        getDetailKey(taskId),
    );

    addSubtaskToCache(qc, taskId, newSubtask);

    return { previousTask };
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
    targetSubtaskId = updatedSubtask.id,
) {
    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;
            const previous = old.subtasks.find(
                (subtask) => subtask.id === targetSubtaskId,
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
                    subtask.id === targetSubtaskId
                        ? updatedSubtask
                        : subtask,
                ),
                completedSubtasksCount: completed,
            };
        },
    );
}

export async function updateSubtaskInCacheOptimistically(
    qc: QueryClient,
    taskId: string,
    subtaskId: string,
    patch: Partial<Pick<Subtask, "title" | "completed">>,
) {
    await qc.cancelQueries({ queryKey: getDetailKey(taskId) });

    const previousTask = qc.getQueryData<TaskDetail>(
        getDetailKey(taskId),
    );

    qc.setQueryData<TaskDetail>(
        getDetailKey(taskId),
        (old) => {
            if (!old) return old;

            const previousSubtask = old.subtasks.find(
                (subtask) => subtask.id === subtaskId,
            );

            if (!previousSubtask) return old;

            const nextCompleted =
                patch.completed ?? previousSubtask.completed;
            let completedSubtasksCount =
                old.completedSubtasksCount ??
                old.subtasks.filter((subtask) => subtask.completed).length;

            if (!previousSubtask.completed && nextCompleted) {
                completedSubtasksCount++;
            }

            if (previousSubtask.completed && !nextCompleted) {
                completedSubtasksCount--;
            }

            return {
                ...old,
                subtasks: old.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                        ? {
                            ...subtask,
                            ...patch,
                            updatedAt: new Date().toISOString(),
                        }
                        : subtask,
                ),
                completedSubtasksCount,
            };
        },
    );

    return { previousTask };
}
