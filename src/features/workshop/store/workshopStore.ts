import { create } from "zustand";
import type {
  CanvasObject,
  CanvasViewport,
  WorkshopSnapshot,
  WorkshopTool,
} from "../types";
import { cloneSnapshot, pushUndo } from "../utils/cloneSnapshotCanvas";
import {
  FEATURE_TASK_BOTTOM_PADDING,
  FEATURE_TASK_HORIZONTAL_PADDING,
  FEATURE_TASK_TOP_OFFSET,
} from "../constants";

// Define the shape of the workshop Data (This describes the data stored inside Zustand.
export interface WorkshopState {
  canvasId: Nullable<string>;
  objects: CanvasObject[];
  viewport: CanvasViewport;
  isDirty: boolean; // indicates if the canvas has unsaved changes
  activeTool: WorkshopTool;
  selectedObjectId: Nullable<string>;
  detailsObjectId: Nullable<string>; // The object currently open in the details drawer. UI-only, never persisted.
  hoveredObjectId: Nullable<string>; // The object currently under the mouse. Used for hover styling.
  undoStack: WorkshopSnapshot[];
  redoStack: WorkshopSnapshot[];
}

// Define the shape of the workshop actions (This describes all functions/actions the store can do.)
interface WorkshopActions {
  setActiveTool: (tool: WorkshopTool) => void;
  selectObject: (id: Nullable<string>) => void; // Select or deselect an object.
  openObjectDetails: (id: string) => void; // Open the details drawer for an object.
  closeObjectDetails: () => void; // Close the details drawer.
  setHoveredObject: (id: Nullable<string>) => void; // Set the object currently under the mouse. Used for hover styling.
  setViewport: (vp: Partial<CanvasViewport>) => void;

  // Object CRUD.
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  moveObject: (id: string, { x, y }: Coordinates) => void;
  deleteObject: (id: string) => void;

  // History operations (Undo and redo canvas changes)
  undo: () => void;
  redo: () => void;

  markClean: () => void; // Mark canvas as saved (Ex. after successful backend save later)
  resetCanvas: () => void;
  loadCanvas: (
    // Load a full canvas. Later, when backend is ready, this will be useful after fetching data
    canvasId: string,
    objects: CanvasObject[],
    viewport: CanvasViewport,
  ) => void;
}

export const useWorkshopStore = create<WorkshopState & WorkshopActions>()(
  (set) => ({
    // Persisted canvas state is loaded from the draft workshop endpoint.
    canvasId: null,
    objects: [],
    viewport: { x: 32, y: 32, scale: 0.82 },

    isDirty: false, // At first, nothing changed

    activeTool: "select", // Default tool is select.

    // At first, no object selected or hovered.
    selectedObjectId: null,
    detailsObjectId: null,
    hoveredObjectId: null,

    // At first, there is no undo/redo history.
    undoStack: [],
    redoStack: [],

    //** actions
    setActiveTool: (tool) => set({ activeTool: tool }),

    selectObject: (id) => set((state) =>
      state.selectedObjectId === id ? state : { selectedObjectId: id },
    ),
    openObjectDetails: (id) => set({ detailsObjectId: id }),
    closeObjectDetails: () => set({ detailsObjectId: null }),
    setHoveredObject: (id) => set((state) =>
      state.hoveredObjectId === id ? state : { hoveredObjectId: id },
    ),

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
      set((state) => {
        const moving = state.objects.find((obj) => obj.id === id);
        if (!moving) return {};
        const dx = x - moving.x;
        const dy = y - moving.y;
        const frames = state.objects.filter((obj) => obj.type === "SECTION_FRAME");
        const containingFrame = moving.type !== "TASK_CARD"
          ? null
          : frames
              .filter((frame) => {
                const centerX = x + moving.width / 2;
                return centerX >= frame.x &&
                  centerX <= frame.x + frame.width &&
                  y >= frame.y &&
                  y <= frame.y + frame.height;
              })
              .sort((a, b) => b.zIndex - a.zIndex)[0];

        const minTaskX = containingFrame
          ? containingFrame.x + FEATURE_TASK_HORIZONTAL_PADDING
          : x;
        const maxTaskX = containingFrame
          ? containingFrame.x + containingFrame.width - moving.width - FEATURE_TASK_HORIZONTAL_PADDING
          : x;
        const nextX = containingFrame
          ? maxTaskX >= minTaskX
            ? Math.min(Math.max(x, minTaskX), maxTaskX)
            : containingFrame.x + Math.max(0, (containingFrame.width - moving.width) / 2)
          : x;
        const nextY = containingFrame
          ? Math.max(y, containingFrame.y + FEATURE_TASK_TOP_OFFSET)
          : y;

        return {
          objects: state.objects.map((obj) => {
            if (obj.id === id) {
              return {
                ...obj,
                x: nextX,
                y: nextY,
                parentFrameId:
                  obj.type === "SECTION_FRAME"
                    ? obj.parentFrameId
                    : containingFrame?.id ?? null,
              };
            }
            if (moving.type === "SECTION_FRAME" && obj.parentFrameId === id) {
              return { ...obj, x: obj.x + dx, y: obj.y + dy };
            }
            if (obj.id === containingFrame?.id) {
              const requiredHeight = nextY + moving.height + FEATURE_TASK_BOTTOM_PADDING - obj.y;
              return requiredHeight > obj.height
                ? { ...obj, height: requiredHeight }
                : obj;
            }
            return obj;
          }),
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    deleteObject: (id) =>
      set((state) => ({
        objects: state.objects
          .filter((obj) => obj.id !== id)
          .map((obj) => (obj.parentFrameId === id ? { ...obj, parentFrameId: null } : obj)),
        selectedObjectId:
          state.selectedObjectId === id ? null : state.selectedObjectId,
        detailsObjectId:
          state.detailsObjectId === id ? null : state.detailsObjectId,
        undoStack: pushUndo(state),
        redoStack: [],
        isDirty: true,
      })),

    setViewport: (vp) =>
      set((state) => {
        const viewport = { ...state.viewport, ...vp };
        return viewport.x === state.viewport.x &&
          viewport.y === state.viewport.y &&
          viewport.scale === state.viewport.scale
          ? state
          : { viewport };
      }),

    undo: () =>
      set((state) => {
        // Gets the latest undo snapshot.
        const snapshot = state.undoStack.at(-1);
        if (!snapshot) return {};

        return {
          // Restore the previous object snapshot.
          objects: snapshot.objects,
          //Removes the snapshot we just used.
          undoStack: state.undoStack.slice(0, -1),
          // Pushes the current state to redo stack, so we can redo it later.
          redoStack: [
            ...state.redoStack,
            cloneSnapshot(state.objects),
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
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [
            ...state.undoStack,
            cloneSnapshot(state.objects),
          ],
          isDirty: true,
        };
      }),

    markClean: () => set({ isDirty: false }),

    resetCanvas: () => set({
      canvasId: null,
      objects: [],
      viewport: { x: 32, y: 32, scale: 0.82 },
      isDirty: false,
      selectedObjectId: null,
      detailsObjectId: null,
      undoStack: [],
      redoStack: [],
    }),

    loadCanvas: (canvasId, objects, viewport) =>
      set({
        canvasId,
        objects,
        viewport,
        isDirty: false,
        undoStack: [],
        redoStack: [],
        selectedObjectId: null,
        detailsObjectId: null,
      }),
  }),
);
