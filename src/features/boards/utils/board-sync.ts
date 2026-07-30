import { useKanbanStore } from "@/store";

export interface BoardSyncMutationContext {
    boardSyncStarted: boolean;
}

export function startBoardSync(): BoardSyncMutationContext {
    useKanbanStore.getState().startSync();
    return { boardSyncStarted: true };
}

export function finishBoardSync(
    context: BoardSyncMutationContext | undefined,
    success: boolean,
) {
    if (!context?.boardSyncStarted) return;
    useKanbanStore.getState().finishSync(success);
}
