import { useQueryClient } from "@tanstack/react-query";
import type { ReorderBoardColumnsDto } from "../types/api/board-api.types";
import { boardService } from "../services";
import { mapBoardColumn } from "../mappers";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
    reorderColumnsInCache,
    reconcileReorderedColumns,
    rollbackColumns,
} from "../cache/board-columns.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useReorderBoardColumns(projectId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: ReorderBoardColumnsDto) =>
            boardService.reorderColumns(projectId, dto),

        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const optimisticContext = await reorderColumnsInCache(
                    queryClient,
                    projectId,
                    dto,
                );
                return { ...syncContext, ...optimisticContext };
            },

            onError: (_, __, context) => {
                rollbackColumns(
                    queryClient,
                    projectId,
                    context?.previousColumns,
                );
            },

            onSuccess: (res) => {
                const columns = res.data.map((c) =>
                    mapBoardColumn(c, projectId),
                );
                reconcileReorderedColumns(
                    queryClient,
                    projectId,
                    columns,
                );
            },
            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        },
    );
}
