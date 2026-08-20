import { useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
    removeColumnFromCache,
    rollbackColumns,
} from "../cache/board-columns.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useDeleteBoardColumn(projectId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (columnId: string) =>
            boardService.deleteColumn(projectId, columnId),

        {
            showSuccessToast: false,

            async onMutate(columnId) {
                const syncContext = startBoardSync();
                const optimisticContext = await removeColumnFromCache(
                    queryClient,
                    projectId,
                    columnId,
                );
                return { ...syncContext, ...optimisticContext };
            },

            onError(_, __, context) {
                rollbackColumns(
                    queryClient,
                    projectId,
                    context?.previousColumns,
                );
            },

            onSettled(_, error, __, context) {
                finishBoardSync(context, !error);
            },
        },
    );
}
