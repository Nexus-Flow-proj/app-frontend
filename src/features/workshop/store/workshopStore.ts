import { create } from "zustand";
import { MAX_UNDO_STEPS } from "../constants";
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

// Define the shape of the workshop Data (This describes the data stored inside Zustand.
interface WorkshopState {
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

// Define the shape of the workshop actions
interface WorkshopActions {
  setActiveTool: (tool: WorkshopTool) => void;
  selectObject: (id: Nullable<string>) => void; // Select or deselect an object.
  setHoveredObject: (id: Nullable<string>) => void; // Set the object currently under the mouse. Used for hover styling.
  // Connection workflow.
  startConnect: (fromId: string) => void;
  finishConnect: (toId: string) => void;
  cancelConnect: () => void;
  // Object CRUD.
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  moveObject: (id: string, x: number, y: number) => void;
  deleteObject: (id: string) => void;

  addConnection: (conn: CanvasConnection) => void;
  deleteConnection: (id: string) => void;
  setViewport: (vp: Partial<CanvasViewport>) => void;
  undo: () => void;
  redo: () => void;
  markClean: () => void;
  loadCanvas: (
    canvasId: string,
    objects: CanvasObject[],
    connections: CanvasConnection[],
    viewport: CanvasViewport,
  ) => void;
}

function cloneSnapshot(
  objects: CanvasObject[],
  connections: CanvasConnection[],
): WorkshopSnapshot {
  return {
    objects: structuredClone(objects),
    connections: structuredClone(connections),
  };
}

function pushUndo(state: WorkshopState): WorkshopSnapshot[] {
  return [
    ...state.undoStack.slice(
      Math.max(0, state.undoStack.length - MAX_UNDO_STEPS + 1),
    ),
    cloneSnapshot(state.objects, state.connections),
  ];
}

export const useWorkshopStore = create<WorkshopState & WorkshopActions>()(
  (set) => ({
    canvasId: "mock-canvas-01",
    objects: mockCanvasObjects,
    connections: mockCanvasConnections,
    viewport: mockViewport,
    isDirty: false,
    activeTool: "select",
    selectedObjectId: null,
    hoveredObjectId: null,
    isConnecting: false,
    connectFromId: null,
    undoStack: [],
    redoStack: [],

    setActiveTool: (tool) =>
      set({
        activeTool: tool,
        ...(tool !== "connect"
          ? { isConnecting: false, connectFromId: null }
          : null),
      }),

    selectObject: (id) => set({ selectedObjectId: id }),
    setHoveredObject: (id) => set({ hoveredObjectId: id }),
    startConnect: (fromId) =>
      set({ isConnecting: true, connectFromId: fromId }),
    cancelConnect: () => set({ isConnecting: false, connectFromId: null }),

    finishConnect: (toId) =>
      set((state) => {
        if (!state.connectFromId || state.connectFromId === toId) {
          return { isConnecting: false, connectFromId: null };
        }

        const exists = state.connections.some(
          (conn) =>
            conn.fromObjectId === state.connectFromId &&
            conn.toObjectId === toId,
        );
        if (exists) return { isConnecting: false, connectFromId: null };

        return {
          connections: [
            ...state.connections,
            {
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

    updateObject: (id, patch) =>
      set((state) => {
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

    moveObject: (id, x, y) =>
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

    addConnection: (conn) =>
      set((state) => ({
        connections: [...state.connections, conn],
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
        const snapshot = state.undoStack.at(-1);
        if (!snapshot) return {};
        return {
          objects: snapshot.objects,
          connections: snapshot.connections,
          undoStack: state.undoStack.slice(0, -1),
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
