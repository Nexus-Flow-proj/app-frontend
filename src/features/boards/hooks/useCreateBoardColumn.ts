import { useQueryClient } from "@tanstack/react-query";
import type { CreateBoardColumnDto } from "../types/api/board-api.types";
import { boardService } from "../services";
import { mapBoardColumn } from "../mappers";
import { useApiMutation } from "@/hooks/useApiMutation";
import { addColumnToCache } from "../cache/board-columns.cache";

export function useCreateBoardColumn(projectId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (dto: CreateBoardColumnDto) =>
            boardService.createColumn(projectId, dto),
        {
            onSuccess: (res) => {
                const newColumn = mapBoardColumn(res.data, projectId);
                addColumnToCache(queryClient, projectId, newColumn);
            }
        }
    )
}