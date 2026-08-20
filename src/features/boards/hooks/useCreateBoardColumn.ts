import { useQueryClient } from "@tanstack/react-query";
import type { CreateBoardColumnDto } from "../types/api/board-api.types";
import { boardService } from "../services";
import { mapBoardColumn } from "../mappers";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants";
import {
    addOptimisticColumnToCache,
    replaceColumnInCache,
    rollbackColumns,
} from "../cache/board-columns.cache";
import type { BoardColumn } from "../types";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useCreateBoardColumn(projectId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (dto: CreateBoardColumnDto) =>
            boardService.createColumn(projectId, dto),
        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const existingColumns =
                    queryClient.getQueryData<BoardColumn[]>(
                        QUERY_KEYS.boards.columns(projectId),
                    ) ?? [];
                const now = new Date().toISOString();
                const tempColumn: BoardColumn = {
                    id: `temp-${crypto.randomUUID()}`,
                    projectId,
                    name: dto.name,
                    color: dto.color,
                    sortOrder:
                        existingColumns.reduce(
                            (max, column) =>
                                Math.max(max, column.sortOrder),
                            0,
                        ) + 1,
                    isProtected: false,
                    createdAt: now,
                };
                const optimisticContext = await addOptimisticColumnToCache(
                    queryClient,
                    projectId,
                    tempColumn,
                );

                return {
                    ...syncContext,
                    ...optimisticContext,
                    tempColumnId: tempColumn.id,
                };
            },

            onSuccess: (res, _, context) => {
                const newColumn = mapBoardColumn(res.data, projectId);
                replaceColumnInCache(
                    queryClient,
                    projectId,
                    newColumn,
                    context?.tempColumnId,
                );
            },

            onError: (_, __, context) => {
                rollbackColumns(
                    queryClient,
                    projectId,
                    context?.previousColumns,
                );
            },

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    )
}
