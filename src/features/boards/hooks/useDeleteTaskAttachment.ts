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

export function useDeleteTaskAttachment(
    projectId: string,
    taskId: string,
) {
    const queryClient = useQueryClient();

    return useApiMutation<ApiTaskAttachmentsMutationResponse, string>(
        (attachmentId) => taskService.deleteAttachment(taskId, attachmentId),
        {
            successMessage: "Attachment deleted",
            onSuccess: async (res) => {
                console.log("Delete task attachment success response:", res);

                await queryClient.cancelQueries({
                    queryKey: QUERY_KEYS.tasks.detail(taskId),
                });

                let nextAttachments: TaskAttachment[] = (
                    res.data.remainingAttachments ?? []
                ).map((attachment) =>
                    mapTaskAttachment(attachment, res.data.taskId),
                );
                let nextAttachmentsCount = res.data.attachmentsCount;

                updateTaskDetailCache(queryClient, taskId, (task) => {
                    const deletedAttachmentId = res.data.deletedAttachment?.id;
                    const attachments: TaskAttachment[] =
                        res.data.remainingAttachments
                            ? res.data.remainingAttachments.map((attachment) =>
                                mapTaskAttachment(attachment, res.data.taskId),
                            )
                            : deletedAttachmentId
                                ? task.attachments.filter(
                                    (attachment) =>
                                        attachment.id !== deletedAttachmentId,
                                )
                                : task.attachments;
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
