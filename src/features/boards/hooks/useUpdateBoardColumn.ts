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

export function useUpdateBoardColumn(
    projectId: string,
    columnId: string,
) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: UpdateBoardColumnDto) =>
            boardService.updateColumn(columnId, dto),

        {
            onMutate: async (dto) => {
                return updateColumnInCache(
                    queryClient,
                    projectId,
                    columnId,
                    dto,
                );
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
                return updateColumnInCache(
                    queryClient,
                    projectId,
                    columnId,
                    dto,
                );
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
        },
    );
}
