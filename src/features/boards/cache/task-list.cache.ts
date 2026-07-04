import type { QueryClient } from "@tanstack/react-query";
import type { Task, TaskList } from "../types";
import { QUERY_KEYS } from "@/constants";

// ── Helpers ──────────────────────────────────────────────────────────

function getListKey(projectId: string) {
    return QUERY_KEYS.tasks.list(projectId);
}

// ── Add ──────────────────────────────────────────────────────────────

export function addTaskToListCache(
    qc: QueryClient,
    projectId: string,
    newTask: Task,
) {
    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return;
            return {
                ...old,
                tasks: [...old.tasks, newTask],
                total: old.total + 1,
            };
        },
    );
}

// ── Remove (optimistic) ─────────────────────────────────────────────

export async function removeTaskFromListCache(
    qc: QueryClient,
    projectId: string,
    taskId: string,
) {
    await qc.cancelQueries({ queryKey: getListKey(projectId) });

    const previousTaskList = qc.getQueryData<TaskList>(
        getListKey(projectId),
    );

    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return;
            const newTasksAfterDeletion = old.tasks.filter(
                (task) => task.id !== taskId,
            );
            return {
                ...old,
                tasks: newTasksAfterDeletion,
                total: old.total - 1,
            };
        },
    );

    return { previousTaskList };
}

// ── Update (optimistic) ─────────────────────────────────────────────

export async function updateTaskInListCache(
    qc: QueryClient,
    projectId: string,
    taskId: string,
    applyUpdate: (task: Task) => Task,
) {
    await qc.cancelQueries({ queryKey: getListKey(projectId) });

    const previousTaskList = qc.getQueryData<TaskList>(
        getListKey(projectId),
    );

    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                tasks: old.tasks.map((task) =>
                    task.id === taskId
                        ? applyUpdate(task)
                        : task,
                ),
            };
        },
    );

    return { previousTaskList };
}

// ── Rollback ────────────────────────────────────────────────────────

export function rollbackTaskList(
    qc: QueryClient,
    projectId: string,
    previousTaskList: TaskList | undefined,
) {
    qc.setQueryData(getListKey(projectId), previousTaskList);
}
// Invalidate

export function invalidateTaskList(qc: QueryClient, projectId: string) {
    qc.invalidateQueries({ queryKey: getListKey(projectId) });
}