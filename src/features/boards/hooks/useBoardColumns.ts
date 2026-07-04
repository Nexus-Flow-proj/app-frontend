import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { mapBoardColumn } from "../mappers/board.mapper";
import { boardService } from "../services";

export function useBoardColumns(projectId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.boards.columns(projectId),

        queryFn: async () => {
            const res = await boardService.getBoardColumns(projectId);

            return res.data.map((column) => mapBoardColumn(column, projectId));
        },
        enabled: !!projectId,
    });
}