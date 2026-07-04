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

export function useReorderBoardColumns(projectId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: ReorderBoardColumnsDto) =>
            boardService.reorderColumns(projectId, dto),

        {
            onMutate: async (dto) => {
                return reorderColumnsInCache(
                    queryClient,
                    projectId,
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
                const columns = res.data.map((c) =>
                    mapBoardColumn(c, projectId),
                );
                reconcileReorderedColumns(
                    queryClient,
                    projectId,
                    columns,
                );
            },
        },
    );
}