import { useMemo } from "react";

import { buildBoardState } from "../mappers";
import { useBoardColumns } from "./useBoardColumns";
import { useProjectTasks } from "./useProjectTasks";

export function useBoardState(projectId: string) {
    const columnsQuery = useBoardColumns(projectId);
    const tasksQuery = useProjectTasks(projectId);

    const boardState = useMemo(() => {
        if (!columnsQuery.data || !tasksQuery.data) {
            return undefined;
        }

        return buildBoardState(
            columnsQuery.data,
            tasksQuery.data.tasks,
        );
    }, [
        columnsQuery.data,
        tasksQuery.data,
    ]);

    return {
        boardState,

        columns: columnsQuery,
        tasks: tasksQuery,

        isLoading:
            columnsQuery.isLoading ||
            tasksQuery.isLoading,

        isError:
            columnsQuery.isError ||
            tasksQuery.isError,
    };
}