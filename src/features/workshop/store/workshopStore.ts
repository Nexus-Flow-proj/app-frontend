import { create } from "zustand";
import { CanvasObjectType } from "@/types/enums";
import type {
  CanvasConnection,
  CanvasObject,
  CanvasViewport,
  TaskCardData,
  WorkshopSnapshot,
  WorkshopTool,
} from "../types";
import { MAX_UNDO_STEPS } from "../constants";
import { cloneSnapshot, pushUndo } from "../utils/cloneSnapshotCanvas";
import { normalizeTaskContainment } from "../utils/featureContainment";

export interface WorkshopState {
  projectId: Nullable<string>;
  canvasId: Nullable<string>;
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
  publishedSnapshot: WorkshopSnapshot;
  publishedViewport: CanvasViewport;
  isEditing: boolean;
  isPublishing: boolean;
  isDirty: boolean;
  activeTool: WorkshopTool;
  selectedObjectId: Nullable<string>;
  detailsObjectId: Nullable<string>;
  hoveredObjectId: Nullable<string>;
  isConnecting: boolean;
  connectFromId: Nullable<string>;
  undoStack: WorkshopSnapshot[];
  redoStack: WorkshopSnapshot[];
}

interface WorkshopActions {
  beginEdit: () => void;
  discardDraft: () => void;
  setPublishing: (isPublishing: boolean) => void;
  completePublish: (
    objects: CanvasObject[],
    connections: CanvasConnection[],
    viewport: CanvasViewport,
  ) => void;
  setActiveTool: (tool: WorkshopTool) => void;
  selectObject: (id: Nullable<string>) => void;
  openObjectDetails: (id: string) => void;
  closeObjectDetails: () => void;
  setHoveredObject: (id: Nullable<string>) => void;
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  moveObject: (id: string, position: Coordinates) => void;
  previewFeatureMove: (id: string, position: Coordinates) => void;
  commitPreviewMove: (snapshot: WorkshopSnapshot) => void;
  deleteObject: (id: string) => void;
  addConnection: (connection: CanvasConnection) => void;
  deleteConnection: (id: string) => void;
  startConnect: (fromId: string) => void;
  finishConnect: (toId: string) => void;
  cancelConnect: () => void;
  undo: () => void;
  redo: () => void;
  markClean: () => void;
  loadCanvas: (
    projectId: string,
    canvasId: string,
    objects: CanvasObject[],
    connections: CanvasConnection[],
    viewport?: CanvasViewport,
  ) => void;
}

const initialSnapshot = cloneSnapshot([], []);
const initialViewport = { x: 24, y: 24, scale: 0.82 };

function appendUndoSnapshot(
  stack: WorkshopSnapshot[],
  snapshot: WorkshopSnapshot,
): WorkshopSnapshot[] {
  const start = Math.max(0, stack.length - MAX_UNDO_STEPS + 1);
  return [
    ...stack.slice(start),
    cloneSnapshot(snapshot.objects, snapshot.connections),
  ];
}

export const useWorkshopStore = create<WorkshopState & WorkshopActions>()(
  (set) => ({
    projectId: null,
    canvasId: null,
    objects: initialSnapshot.objects,
    connections: initialSnapshot.connections,
    viewport: initialViewport,
    publishedSnapshot: cloneSnapshot(
      initialSnapshot.objects,
      initialSnapshot.connections,
    ),
    publishedViewport: initialViewport,
    isEditing: false,
    isPublishing: false,
    isDirty: false,
    activeTool: "select",
    selectedObjectId: null,
    detailsObjectId: null,
    hoveredObjectId: null,
    isConnecting: false,
    connectFromId: null,
    undoStack: [],
    redoStack: [],

    beginEdit: () =>
      set((state) => {
        if (state.isEditing || state.isPublishing) return {};
        return {
          publishedSnapshot: cloneSnapshot(state.objects, state.connections),
          publishedViewport: structuredClone(state.viewport),
          isEditing: true,
          isDirty: false,
          activeTool: "select",
          selectedObjectId: null,
          detailsObjectId: null,
          undoStack: [],
          redoStack: [],
        };
      }),

    discardDraft: () =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        const published = cloneSnapshot(
          state.publishedSnapshot.objects,
          state.publishedSnapshot.connections,
        );
        return {
          objects: published.objects,
          connections: published.connections,
          viewport: structuredClone(state.publishedViewport),
          isEditing: false,
          isDirty: false,
          activeTool: "select",
          selectedObjectId: null,
          detailsObjectId: null,
          hoveredObjectId: null,
          isConnecting: false,
          connectFromId: null,
          undoStack: [],
          redoStack: [],
        };
      }),

    setPublishing: (isPublishing) => set({ isPublishing }),

    completePublish: (objects, connections, viewport) => {
      const published = cloneSnapshot(objects, connections);
      set({
        objects: published.objects,
        connections: published.connections,
        viewport: structuredClone(viewport),
        publishedSnapshot: cloneSnapshot(
          published.objects,
          published.connections,
        ),
        publishedViewport: structuredClone(viewport),
        isEditing: false,
        isPublishing: false,
        isDirty: false,
        activeTool: "select",
        selectedObjectId: null,
        detailsObjectId: null,
        hoveredObjectId: null,
        isConnecting: false,
        connectFromId: null,
        undoStack: [],
        redoStack: [],
      });
    },

    setActiveTool: (tool) =>
      set((state) => {
        if (!state.isEditing && tool !== "select" && tool !== "pan") {
          return {};
        }
        return {
          activeTool: tool,
          ...(tool !== "connect"
            ? { isConnecting: false, connectFromId: null }
            : {}),
        };
      }),

    selectObject: (id) => set({ selectedObjectId: id }),
    openObjectDetails: (id) => set({ detailsObjectId: id }),
    closeObjectDetails: () => set({ detailsObjectId: null }),
    setHoveredObject: (id) => set({ hoveredObjectId: id }),
    setViewport: (viewport) =>
      set((state) => {
        const nextViewport = { ...state.viewport, ...viewport };
        const changed =
          nextViewport.x !== state.viewport.x ||
          nextViewport.y !== state.viewport.y ||
          nextViewport.scale !== state.viewport.scale;
        return {
          viewport: nextViewport,
          ...(state.isEditing && changed ? { isDirty: true } : {}),
        };
      }),

    startConnect: (fromId) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        const source = state.objects.find((object) => object.id === fromId);
        if (source?.type !== CanvasObjectType.SECTION_FRAME) return {};
        return { isConnecting: true, connectFromId: fromId };
      }),

    cancelConnect: () => set({ isConnecting: false, connectFromId: null }),

    finishConnect: (toId) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing || !state.connectFromId) {
          return { isConnecting: false, connectFromId: null };
        }
        const source = state.objects.find(
          (object) => object.id === state.connectFromId,
        );
        const target = state.objects.find((object) => object.id === toId);
        if (
          source?.type !== CanvasObjectType.SECTION_FRAME ||
          target?.type !== CanvasObjectType.SECTION_FRAME ||
          source.id === target.id
        ) {
          return { isConnecting: false, connectFromId: null };
        }
        const exists = state.connections.some(
          (connection) =>
            connection.fromObjectId === source.id &&
            connection.toObjectId === target.id,
        );
        if (exists) return { isConnecting: false, connectFromId: null };

        return {
          connections: [
            ...state.connections,
            {
              id: `connection-${Date.now()}`,
              fromObjectId: source.id,
              toObjectId: target.id,
              style: {
                color: "#8B5CF6",
                strokeWidth: 2,
                type: "ARROW",
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

    addObject: (object) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        return {
          objects: [...state.objects, object],
          selectedObjectId: object.id,
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    updateObject: (id, patch) =>
      set((state) => {
        if (
          !state.isEditing ||
          state.isPublishing ||
          !state.objects.some((object) => object.id === id)
        ) {
          return {};
        }
        return {
          objects: state.objects.map((object) =>
            object.id === id ? { ...object, ...patch } : object,
          ),
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    moveObject: (id, { x, y }) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        const movingObject = state.objects.find((object) => object.id === id);
        if (!movingObject) return {};
        const dx = x - movingObject.x;
        const dy = y - movingObject.y;
        return {
          objects: state.objects.map((object) => {
            if (object.id === id) return { ...object, x, y };
            if (
              movingObject.type === CanvasObjectType.SECTION_FRAME &&
              object.type === CanvasObjectType.TASK_CARD &&
              (object.data as TaskCardData).featureId === id
            ) {
              return { ...object, x: object.x + dx, y: object.y + dy };
            }
            return object;
          }),
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    previewFeatureMove: (id, { x, y }) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        const feature = state.objects.find(
          (object) =>
            object.id === id &&
            object.type === CanvasObjectType.SECTION_FRAME,
        );
        if (!feature) return {};
        const dx = x - feature.x;
        const dy = y - feature.y;
        if (dx === 0 && dy === 0) return {};

        return {
          objects: state.objects.map((object) => {
            if (object.id === id) return { ...object, x, y };
            if (
              object.type === CanvasObjectType.TASK_CARD &&
              (object.data as TaskCardData).featureId === id
            ) {
              return { ...object, x: object.x + dx, y: object.y + dy };
            }
            return object;
          }),
        };
      }),

    commitPreviewMove: (snapshot) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        const changed =
          JSON.stringify(snapshot.objects) !== JSON.stringify(state.objects);
        if (!changed) return {};
        return {
          undoStack: appendUndoSnapshot(state.undoStack, snapshot),
          redoStack: [],
          isDirty: true,
        };
      }),

    deleteObject: (id) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        const selected = state.objects.find((object) => object.id === id);
        const idsToDelete = new Set([id]);

        if (selected?.type === CanvasObjectType.SECTION_FRAME) {
          state.objects.forEach((object) => {
            if (
              object.type === CanvasObjectType.TASK_CARD &&
              (object.data as TaskCardData).featureId === id
            ) {
              idsToDelete.add(object.id);
            }
          });
        }

        return {
          objects: state.objects.filter(
            (object) => !idsToDelete.has(object.id),
          ),
          connections: state.connections.filter(
            (connection) =>
              !idsToDelete.has(connection.fromObjectId) &&
              !idsToDelete.has(connection.toObjectId),
          ),
          selectedObjectId: idsToDelete.has(state.selectedObjectId ?? "")
            ? null
            : state.selectedObjectId,
          detailsObjectId: idsToDelete.has(state.detailsObjectId ?? "")
            ? null
            : state.detailsObjectId,
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    addConnection: (connection) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        return {
          connections: [...state.connections, connection],
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    deleteConnection: (id) =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
        return {
          connections: state.connections.filter(
            (connection) => connection.id !== id,
          ),
          undoStack: pushUndo(state),
          redoStack: [],
          isDirty: true,
        };
      }),

    undo: () =>
      set((state) => {
        if (!state.isEditing || state.isPublishing) return {};
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
        if (!state.isEditing || state.isPublishing) return {};
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

    loadCanvas: (projectId, canvasId, objects, connections, viewport) =>
      set((state) => {
        if (state.isEditing || state.isPublishing) return {};
        const normalizedObjects = normalizeTaskContainment(objects);
        const published = cloneSnapshot(normalizedObjects, connections);
        const loadedViewport = viewport ?? initialViewport;
        return {
          projectId,
          canvasId,
          objects: published.objects,
          connections: published.connections,
          viewport: structuredClone(loadedViewport),
          publishedSnapshot: cloneSnapshot(
            published.objects,
            published.connections,
          ),
          publishedViewport: structuredClone(loadedViewport),
          isDirty: false,
          undoStack: [],
          redoStack: [],
          selectedObjectId: null,
          detailsObjectId: null,
          activeTool: "select",
        };
      }),
  }),
);
