import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useKanbanStore } from "@/store";

import { updateTaskDetailCache } from "../cache/task-detail.cache";
import { patchTaskInListCache } from "../cache/task-list.cache";
import { mapTaskAttachment } from "../mappers";
import { taskService } from "../services";
import type { TaskAttachment } from "../types";
import type { ApiTaskAttachmentsMutationResponse } from "../types/api/board-api.types";

interface UseUploadTaskAttachmentsVariables {
    files: File[];
}

export function useUploadTaskAttachments(
    projectId: string,
    taskId: string,
) {
    const queryClient = useQueryClient();

    return useApiMutation<
        ApiTaskAttachmentsMutationResponse,
        UseUploadTaskAttachmentsVariables
    >(
        ({ files }) => taskService.uploadAttachments(taskId, files),
        {
            successMessage: "Attachments uploaded",
            onSuccess: async (res) => {
                console.log("Upload task attachments success response:", res);

                await queryClient.cancelQueries({
                    queryKey: QUERY_KEYS.tasks.detail(taskId),
                });

                let nextAttachments: TaskAttachment[] = (
                    res.data.allAttachments ?? []
                ).map((attachment) =>
                    mapTaskAttachment(attachment, res.data.taskId),
                );
                let nextAttachmentsCount = res.data.attachmentsCount;

                updateTaskDetailCache(queryClient, taskId, (task) => {
                    const uploadedAttachments: TaskAttachment[] = (
                        res.data.newAttachments ?? []
                    ).map((attachment) =>
                        mapTaskAttachment(attachment, res.data.taskId),
                    );
                    const attachments: TaskAttachment[] =
                        res.data.allAttachments
                            ? res.data.allAttachments.map((attachment) =>
                                mapTaskAttachment(attachment, res.data.taskId),
                            )
                            : [
                                ...task.attachments,
                                ...uploadedAttachments.filter(
                                    (attachment) =>
                                        !task.attachments.some(
                                            (existing) =>
                                                existing.id === attachment.id,
                                        ),
                                ),
                            ];
                    nextAttachments = attachments;
                    nextAttachmentsCount =
                        res.data.attachmentsCount ?? attachments.length;

                    return {
                        ...task,
                        attachments,
                        attachmentsCount: nextAttachmentsCount,
                    };
                });
                const { drawer, setDrawerTask } = useKanbanStore.getState();
                if (drawer.activeTask?.id === taskId) {
                    setDrawerTask({
                        ...drawer.activeTask,
                        attachments: nextAttachments,
                        attachmentsCount: nextAttachmentsCount,
                    });
                }
                await queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.tasks.detail(taskId),
                });
                patchTaskInListCache(queryClient, projectId, taskId, (task) => ({
                    ...task,
                    attachmentsCount: res.data.attachmentsCount,
                }));
            },
        },
    );
}
