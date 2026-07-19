import { MAX_UNDO_STEPS } from "../constants";
import type { WorkshopState } from "../store/workshopStore";
import type {
  CanvasConnection,
  CanvasObject,
  WorkshopSnapshot,
} from "../types";

/**
 ** This creates a deep copy of objects and connections.
 ** Why deep copy matters:
 ** If we did this:
 ** objects: objects
 ** then the snapshot would point to the same array/object references. Later edits could accidentally mutate the snapshot too.
 ** structuredClone makes a completely separate copy.
 ** This is important for undo/redo.

 * @param objects
 * @param connections
 * @returns {WorkshopSnapshot}
 */

export function cloneSnapshot(
  objects: CanvasObject[],
  connections: CanvasConnection[],
): WorkshopSnapshot {
  return {
    objects: structuredClone(objects),
    connections: structuredClone(connections),
  };
}

/**
 ** This does two things:
 ** First, it keeps only the allowed number of undo steps.
 ** Second, it adds the current canvas snapshot at the end.

 * @param state
 * @returns []
 */
export function pushUndo(state: WorkshopState): WorkshopSnapshot[] {
  const start = Math.max(0, state.undoStack.length - MAX_UNDO_STEPS + 1); // the index of the first snapshot to keep. If we have 10 snapshots and max is 5, we want to keep the last 5, so start = 10 - 5 + 1 = 6. We will slice from index 6 to the end (10), which gives us 4 snapshots (index 6,7,8,9). Then we will add the new snapshot at the end, making it 5 total.

  console.log(
    "pushUndo: start",
    start,
    "state.undoStack.length",
    state.undoStack.length,
  );

  return [
    ...state.undoStack.slice(start),
    cloneSnapshot(state.objects, state.connections),
  ];
}
