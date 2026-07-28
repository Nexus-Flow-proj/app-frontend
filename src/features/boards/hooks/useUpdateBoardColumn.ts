import { useQueryClient } from "@tanstack/react-query";
import type { UpdateBoardColumnDto } from "../types/api/board-api.types";
import { boardService } from "../services";
import { mapBoardColumn } from "../mappers";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
    updateColumnInCache,
    replaceColumnInCache,
    rollbackColumns,
} from "../cache/board-columns.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useUpdateBoardColumn(
    projectId: string,
    columnId: string,
) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: UpdateBoardColumnDto) =>
            boardService.updateColumn(columnId, dto),

        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const optimisticContext = await updateColumnInCache(
                    queryClient,
                    projectId,
                    columnId,
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
                const updated = mapBoardColumn(res.data, projectId);
                replaceColumnInCache(
                    queryClient,
                    projectId,
                    updated,
                );
            },
            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        },
    );
}

interface UpdateBoardColumnByIdVariables {
    columnId: string;
    dto: UpdateBoardColumnDto;
}

export function useUpdateBoardColumnById(projectId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        ({ columnId, dto }: UpdateBoardColumnByIdVariables) =>
            boardService.updateColumn(columnId, dto),

        {
            showSuccessToast: false,

            onMutate: async ({ columnId, dto }) => {
                const syncContext = startBoardSync();
                const optimisticContext = await updateColumnInCache(
                    queryClient,
                    projectId,
                    columnId,
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
                const updated = mapBoardColumn(res.data, projectId);
                replaceColumnInCache(
                    queryClient,
                    projectId,
                    updated,
                );
            },
            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        },
    );
}
