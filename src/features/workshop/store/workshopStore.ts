import { create } from "zustand";
import {
  mockCanvasConnections,
  mockCanvasObjects,
  mockViewport,
} from "../data/workshop-mock";
import type {
  CanvasConnection,
  CanvasObject,
  CanvasViewport,
  WorkshopSnapshot,
  WorkshopTool,
} from "../types";
import { cloneSnapshot, pushUndo } from "../utils/cloneSnapshotCanvas";

// Define the shape of the workshop Data (This describes the data stored inside Zustand.
export interface WorkshopState {
  canvasId: Nullable<string>;
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
  isDirty: boolean; // indicates if the canvas has unsaved changes
  activeTool: WorkshopTool;
  selectedObjectId: Nullable<string>;
  hoveredObjectId: Nullable<string>; // The object currently under the mouse. Used for hover styling.
  isConnecting: boolean; // True when the user has clicked a source node and is hovering over the canvas to select a target node.
  connectFromId: Nullable<string>; // The ID of the source node when isConnecting is true. Used to create a new connection when the user clicks a target node.
  undoStack: WorkshopSnapshot[];
  redoStack: WorkshopSnapshot[];
}

// Define the shape of the workshop actions (This describes all functions/actions the store can do.)
interface WorkshopActions {
  setActiveTool: (tool: WorkshopTool) => void;
  selectObject: (id: Nullable<string>) => void; // Select or deselect an object.
  setHoveredObject: (id: Nullable<string>) => void; // Set the object currently under the mouse. Used for hover styling.
  setViewport: (vp: Partial<CanvasViewport>) => void;

  // Object CRUD.
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  moveObject: (id: string, { x, y }: Coordinates) => void;
  deleteObject: (id: string) => void;

  // Connection CRUD.
  addConnection: (conn: CanvasConnection) => void;
  deleteConnection: (id: string) => void;

  // Connection workflow.
  startConnect: (fromId: string) => void;
  finishConnect: (toId: string) => void;
  cancelConnect: () => void;

  // History operations (Undo and redo canvas changes)
  undo: () => void;
  redo: () => void;

  markClean: () => void; // Mark canvas as saved (Ex. after successful backend save later)
  loadCanvas: (
    // Load a full canvas. Later, when backend is ready, this will be useful after fetching data
    canvasId: string,
    objects: CanvasObject[],
    connections: CanvasConnection[],
    viewport: CanvasViewport,
  ) => void;
}

export const useWorkshopStore = create<WorkshopState & WorkshopActions>()(
  (set) => ({
    //** state
    // This is the initial state of the store. Later, when backend is ready, this will be replaced with data fetched from the backend.
    // For now, we use mock data.
    canvasId: "mock-canvas-01",
    objects: mockCanvasObjects,
    connections: mockCanvasConnections,
    viewport: mockViewport,

    isDirty: false, // At first, nothing changed

    activeTool: "select", // Default tool is select.

    // At first, no object selected or hovered.
    selectedObjectId: null,
    hoveredObjectId: null,

    // At first, user is not creating a connection.
    isConnecting: false,
    connectFromId: null,

    // At first, there is no undo/redo history.
    undoStack: [],
    redoStack: [],

    //** actions
    setActiveTool: (tool) =>
      set({
        activeTool: tool,
        // If the user changes to any tool except "connect", it cancels connection mode.
        ...(tool !== "connect"
          ? { isConnecting: false, connectFromId: null }
          : null),
      }),

    selectObject: (id) => set({ selectedObjectId: id }),
    setHoveredObject: (id) => set({ hoveredObjectId: id }), // This is UI-only state. It should never be saved to backend

    startConnect: (fromId) =>
      set({ isConnecting: true, connectFromId: fromId }),
    cancelConnect: () => set({ isConnecting: false, connectFromId: null }),
    finishConnect: (toId) =>
      set((state) => {
        // Case 1: no source, or source equals target: This prevents invalid connections
        if (!state.connectFromId || state.connectFromId === toId) {
          return { isConnecting: false, connectFromId: null };
        }

        // Case 2: duplicate connection: This prevents duplicate arrows.
        const exists = state.connections.some(
          (conn) =>
            conn.fromObjectId === state.connectFromId &&
            conn.toObjectId === toId,
        );
        if (exists) return { isConnecting: false, connectFromId: null };

        return {
          connections: [
            // This is immutable update. We do not mutate the old array.
            ...state.connections,
            {
              // newConnection
              id: `conn-${Date.now()}`,
              fromObjectId: state.connectFromId,
              toObjectId: toId,
              style: {
                color: "#9063EB",
                strokeWidth: 2,
                dashed: false,
                arrowEnd: true,
              },
            },
          ],
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
          isConnecting: false,
          connectFromId: null,
        };
      }),

    addObject: (obj) =>
      set((state) => ({
        objects: [...state.objects, obj],
        selectedObjectId: obj.id,
        undoStack: pushUndo(state),
        redoStack: [],
        isDirty: true,
      })),

    /**
       * Important: this is a shallow patch.
        This works:
        updateObject(id, { x: 100 })
        This works too:
        updateObject(id, { data: newData })
        But this would be wrong if you expected deep merging:
        updateObject(id, {
          data: { title: "Only title" }
        })
        That would replace the entire data object and lose other fields.
        That is why drawer code does this:
        data: {
          ...(obj.data as TaskCardData),
          title: form.title,
        }
        It preserves existing data manually.
      */
    updateObject: (id, patch) =>
      set((state) => {
        // First it checks if the object exists.
        if (!state.objects.some((obj) => obj.id === id)) return {};
        return {
          objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...patch } : obj,
          ),
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    /**
     * does not push to undo stack. because dragging fires many updates. If every drag movement pushed undo,
     * one drag would create dozens or hundreds of undo entries.
     */
    moveObject: (id, { x, y }) =>
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, x, y } : obj,
        ),
        isDirty: true,
      })),

    deleteObject: (id) =>
      set((state) => ({
        objects: state.objects.filter((obj) => obj.id !== id),
        connections: state.connections.filter(
          (conn) => conn.fromObjectId !== id && conn.toObjectId !== id,
        ),
        selectedObjectId:
          state.selectedObjectId === id ? null : state.selectedObjectId,
        undoStack: pushUndo(state),
        redoStack: [],
        isDirty: true,
      })),

    addConnection: (newConnection) =>
      set((state) => ({
        connections: [...state.connections, newConnection],
        undoStack: pushUndo(state),
        redoStack: [],
        isDirty: true,
      })),

    deleteConnection: (id) =>
      set((state) => ({
        connections: state.connections.filter((conn) => conn.id !== id),
        undoStack: pushUndo(state),
        redoStack: [],
        isDirty: true,
      })),

    setViewport: (vp) =>
      set((state) => ({ viewport: { ...state.viewport, ...vp } })),

    undo: () =>
      set((state) => {
        // Gets the latest undo snapshot.
        const snapshot = state.undoStack.at(-1);
        if (!snapshot) return {};

        return {
          // Restores old objects and connections.
          objects: snapshot.objects,
          connections: snapshot.connections,
          //Removes the snapshot we just used.
          undoStack: state.undoStack.slice(0, -1),
          // Pushes the current state to redo stack, so we can redo it later.
          redoStack: [
            ...state.redoStack,
            cloneSnapshot(state.objects, state.connections),
          ],
          isDirty: true,
        };
      }),

    redo: () =>
      set((state) => {
        const snapshot = state.redoStack.at(-1);
        if (!snapshot) return {};
        return {
          objects: snapshot.objects,
          connections: snapshot.connections,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [
            ...state.undoStack,
            cloneSnapshot(state.objects, state.connections),
          ],
          isDirty: true,
        };
      }),

    markClean: () => set({ isDirty: false }),

    loadCanvas: (canvasId, objects, connections, viewport) =>
      set({
        canvasId,
        objects,
        connections,
        viewport,
        isDirty: false,
        undoStack: [],
        redoStack: [],
        selectedObjectId: null,
      }),
  }),
);
