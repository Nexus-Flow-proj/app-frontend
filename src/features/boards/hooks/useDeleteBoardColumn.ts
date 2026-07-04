import { useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
    removeColumnFromCache,
    rollbackColumns,
} from "../cache/board-columns.cache";

export function useDeleteBoardColumn(projectId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (columnId: string) =>
            boardService.deleteColumn(columnId),

        {
            async onMutate(columnId) {
                return removeColumnFromCache(
                    queryClient,
                    projectId,
                    columnId,
                );
            },

            onError(_, __, context) {
                rollbackColumns(
                    queryClient,
                    projectId,
                    context?.previousColumns,
                );
            },
        },
    );
}