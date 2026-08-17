import { create } from "zustand";
import { MINI_MAX_HISTORY } from "../constants/design";
import type {
  BoardTaskReferenceObject,
  ConnectorRouting,
  MiniCanvasObject,
  MiniConnection,
  MiniImageAsset,
  MiniObjectStyle,
  MiniShapeKind,
  MiniTool,
  MiniViewport,
  MiniWorkshopScene,
  SelectionAlignment,
} from "../types";
import { combinedBounds } from "../utils/geometry";
import { DEFAULT_STYLE, createMiniId } from "../utils/objectFactory";

interface HistorySnapshot {
  objectsById: Record<string, MiniCanvasObject>;
  objectOrder: string[];
  connections: MiniConnection[];
}

interface MiniWorkshopState extends HistorySnapshot {
  assets: Record<string, MiniImageAsset>;
  viewport: MiniViewport;
  selectedIds: string[];
  activeTool: MiniTool;
  activeShape: MiniShapeKind;
  defaultStyle: MiniObjectStyle;
  connectorRouting: ConnectorRouting;
  connectorSourceId: string | null;
  dirty: boolean;
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  loadScene: (scene: MiniWorkshopScene) => void;
  scene: () => MiniWorkshopScene;
  markClean: () => void;
  setViewport: (viewport: MiniViewport) => void;
  setTool: (tool: MiniTool) => void;
  setShape: (shape: MiniShapeKind) => void;
  setDefaultStyle: (patch: Partial<MiniObjectStyle>) => void;
  setConnectorRouting: (routing: ConnectorRouting) => void;
  setConnectorSource: (id: string | null) => void;
  select: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  addObjects: (objects: MiniCanvasObject[], connections?: MiniConnection[]) => void;
  updateObject: (id: string, patch: Partial<MiniCanvasObject>, recordHistory?: boolean) => void;
  updateObjects: (updates: Array<{ id: string; patch: Partial<MiniCanvasObject> }>) => void;
  updateSelectedStyle: (patch: Partial<MiniCanvasObject["style"]>) => void;
  deleteObjects: (ids: string[]) => void;
  deleteSelected: () => void;
  addConnection: (connection: MiniConnection) => void;
  updateConnectionRouting: (routing: ConnectorRouting) => void;
  duplicateSelected: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  alignSelected: (alignment: SelectionAlignment) => void;
  distributeSelected: (axis: "horizontal" | "vertical") => void;
  reorderSelected: (direction: "front" | "forward" | "backward" | "back") => void;
  toggleSelectedLock: () => void;
  addAsset: (asset: MiniImageAsset) => void;
  refreshBoardTasks: (tasks: Array<{ id: string; title: string; description?: string; priority: string; status: string; dueDate?: string; assignee?: { name?: string } | null }>) => void;
  undo: () => void;
  redo: () => void;
}

const EMPTY_VIEWPORT: MiniViewport = { x: 40, y: 40, scale: 1 };
const DEFAULT_CREATION_STYLE: MiniObjectStyle = {
  ...DEFAULT_STYLE,
  fill: "#ede9fe",
  stroke: "#8b5cf6",
};

function cloneObjects(objects: Record<string, MiniCanvasObject>) {
  return Object.fromEntries(Object.entries(objects).map(([id, object]) => [id, structuredClone(object)]));
}

function snapshot(state: HistorySnapshot): HistorySnapshot {
  return { objectsById: cloneObjects(state.objectsById), objectOrder: [...state.objectOrder], connections: structuredClone(state.connections) };
}

function history(state: MiniWorkshopState) {
  return {
    undoStack: [...state.undoStack.slice(-(MINI_MAX_HISTORY - 1)), snapshot(state)],
    redoStack: [],
    dirty: true,
  };
}

function zRange(state: MiniWorkshopState) {
  const values = state.objectOrder.map((id) => state.objectsById[id]?.zIndex ?? 0);
  return { min: Math.min(0, ...values), max: Math.max(0, ...values) };
}

export const useMiniWorkshopStore = create<MiniWorkshopState>((set, get) => ({
  objectsById: {}, objectOrder: [], connections: [], assets: {}, viewport: EMPTY_VIEWPORT,
  selectedIds: [], activeTool: "select", activeShape: "rounded-rectangle", defaultStyle: DEFAULT_CREATION_STYLE, connectorRouting: "curved",
  connectorSourceId: null, dirty: false, undoStack: [], redoStack: [],

  loadScene: (scene) => set({
    objectsById: Object.fromEntries(scene.objects.map((object) => [object.id, structuredClone(object)])),
    objectOrder: [...scene.objects].sort((a, b) => a.zIndex - b.zIndex).map(({ id }) => id),
    connections: structuredClone(scene.connections), assets: structuredClone(scene.assets),
    viewport: { ...scene.viewport }, selectedIds: [], connectorSourceId: null, dirty: false, undoStack: [], redoStack: [],
  }),
  scene: () => {
    const state = get();
    return {
      viewport: { ...state.viewport },
      objects: state.objectOrder.map((id) => state.objectsById[id]).filter(Boolean).map((object) => structuredClone(object)),
      connections: structuredClone(state.connections), assets: structuredClone(state.assets),
    };
  },
  markClean: () => set({ dirty: false }),
  setViewport: (viewport) => set({ viewport }),
  setTool: (activeTool) => set({ activeTool, connectorSourceId: activeTool === "connector" ? get().connectorSourceId : null }),
  setShape: (activeShape) => set({ activeShape, activeTool: "shape" }),
  setDefaultStyle: (patch) => set((state) => ({ defaultStyle: { ...state.defaultStyle, ...patch } })),
  setConnectorRouting: (connectorRouting) => set({ connectorRouting }),
  setConnectorSource: (connectorSourceId) => set({ connectorSourceId }),
  select: (selectedIds) => set({ selectedIds }),
  toggleSelection: (id) => set((state) => ({ selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter((value) => value !== id) : [...state.selectedIds, id] })),
  addObjects: (objects, connections = []) => set((state) => ({
    ...history(state),
    objectsById: { ...state.objectsById, ...Object.fromEntries(objects.map((object) => [object.id, object])) },
    objectOrder: [...state.objectOrder, ...objects.map(({ id }) => id)],
    connections: [...state.connections, ...connections], selectedIds: objects.map(({ id }) => id),
  })),
  updateObject: (id, patch, recordHistory = true) => set((state) => {
    const current = state.objectsById[id];
    if (!current || current.locked && !Object.hasOwn(patch, "locked")) return state;
    return {
      ...(recordHistory ? history(state) : { dirty: true }),
      objectsById: { ...state.objectsById, [id]: { ...current, ...patch } as MiniCanvasObject },
    };
  }),
  updateObjects: (updates) => set((state) => {
    if (!updates.length) return state;
    const objectsById = { ...state.objectsById };
    updates.forEach(({ id, patch }) => {
      const current = objectsById[id];
      if (current && (!current.locked || Object.hasOwn(patch, "locked"))) objectsById[id] = { ...current, ...patch } as MiniCanvasObject;
    });
    return { ...history(state), objectsById };
  }),
  updateSelectedStyle: (patch) => set((state) => ({
    ...history(state),
    objectsById: Object.fromEntries(Object.entries(state.objectsById).map(([id, object]) => [id, state.selectedIds.includes(id) ? { ...object, style: { ...object.style, ...patch } } : object])),
  })),
  deleteObjects: (ids) => set((state) => {
    const targets = new Set(ids.filter((id) => !state.objectsById[id]?.locked));
    if (!targets.size) return state;
    return {
      ...history(state),
      objectsById: Object.fromEntries(Object.entries(state.objectsById).filter(([id]) => !targets.has(id))),
      objectOrder: state.objectOrder.filter((id) => !targets.has(id)),
      connections: state.connections.filter((item) => !targets.has(item.sourceObjectId) && !targets.has(item.targetObjectId)),
      selectedIds: state.selectedIds.filter((id) => !targets.has(id)),
    };
  }),
  deleteSelected: () => get().deleteObjects(get().selectedIds),
  addConnection: (connection) => set((state) => ({ ...history(state), connections: [...state.connections, connection], connectorSourceId: null })),
  updateConnectionRouting: (routing) => set((state) => ({ ...history(state), connectorRouting: routing, connections: state.connections.map((connection) => state.selectedIds.includes(connection.sourceObjectId) || state.selectedIds.includes(connection.targetObjectId) ? { ...connection, routing } : connection) })),
  duplicateSelected: () => set((state) => {
    const map = new Map<string, string>();
    const groupMap = new Map<string, string>();
    const copies = state.selectedIds.map((id, index) => {
      const source = state.objectsById[id]; if (!source) return null;
      const nextId = createMiniId("object"); map.set(id, nextId);
      if (source.groupId && !groupMap.has(source.groupId)) groupMap.set(source.groupId, createMiniId("group"));
      return { ...structuredClone(source), id: nextId, x: source.x + 28, y: source.y + 28, zIndex: zRange(state).max + index + 1, groupId: source.groupId ? groupMap.get(source.groupId)! : null } as MiniCanvasObject;
    }).filter(Boolean) as MiniCanvasObject[];
    const connections = state.connections.filter((item) => map.has(item.sourceObjectId) && map.has(item.targetObjectId)).map((item) => ({ ...structuredClone(item), id: createMiniId("connection"), sourceObjectId: map.get(item.sourceObjectId)!, targetObjectId: map.get(item.targetObjectId)! }));
    return { ...history(state), objectsById: { ...state.objectsById, ...Object.fromEntries(copies.map((object) => [object.id, object])) }, objectOrder: [...state.objectOrder, ...copies.map(({ id }) => id)], connections: [...state.connections, ...connections], selectedIds: copies.map(({ id }) => id) };
  }),
  groupSelected: () => set((state) => {
    if (state.selectedIds.length < 2) return state;
    const groupId = createMiniId("group");
    return { ...history(state), objectsById: Object.fromEntries(Object.entries(state.objectsById).map(([id, object]) => [id, state.selectedIds.includes(id) ? { ...object, groupId } : object])) };
  }),
  ungroupSelected: () => set((state) => ({ ...history(state), objectsById: Object.fromEntries(Object.entries(state.objectsById).map(([id, object]) => [id, state.selectedIds.includes(id) ? { ...object, groupId: null } : object])) })),
  alignSelected: (alignment) => set((state) => {
    const selected = state.selectedIds.map((id) => state.objectsById[id]).filter(Boolean);
    if (selected.length < 2) return state;
    const box = combinedBounds(selected)!;
    const objectsById = { ...state.objectsById };
    selected.forEach((object) => {
      let x = object.x; let y = object.y;
      if (alignment === "left") x = box.x;
      if (alignment === "center-horizontal") x = box.x + (box.width - object.width) / 2;
      if (alignment === "right") x = box.x + box.width - object.width;
      if (alignment === "top") y = box.y;
      if (alignment === "center-vertical") y = box.y + (box.height - object.height) / 2;
      if (alignment === "bottom") y = box.y + box.height - object.height;
      objectsById[object.id] = { ...object, x, y } as MiniCanvasObject;
    });
    return { ...history(state), objectsById };
  }),
  distributeSelected: (axis) => set((state) => {
    const selected = state.selectedIds.map((id) => state.objectsById[id]).filter(Boolean).sort((a, b) => axis === "horizontal" ? a.x - b.x : a.y - b.y);
    if (selected.length < 3) return state;
    const first = selected[0]; const last = selected[selected.length - 1];
    const start = axis === "horizontal" ? first.x : first.y;
    const end = axis === "horizontal" ? last.x + last.width : last.y + last.height;
    const occupiedSpace = selected.reduce(
      (total, object) => total + (axis === "horizontal" ? object.width : object.height),
      0,
    );
    const gap = (end - start - occupiedSpace) / (selected.length - 1);
    const objectsById = { ...state.objectsById };
    let cursor = start;
    selected.forEach((object) => {
      objectsById[object.id] = {
        ...object,
        [axis === "horizontal" ? "x" : "y"]: cursor,
      } as MiniCanvasObject;
      cursor += (axis === "horizontal" ? object.width : object.height) + gap;
    });
    return { ...history(state), objectsById };
  }),
  reorderSelected: (direction) => set((state) => {
    const { min, max } = zRange(state);
    const delta = direction === "front" ? max + 1 : direction === "back" ? min - 1 : direction === "forward" ? 1 : -1;
    const objectsById = Object.fromEntries(Object.entries(state.objectsById).map(([id, object]) => [id, state.selectedIds.includes(id) ? { ...object, zIndex: direction === "front" || direction === "back" ? delta : object.zIndex + delta } : object]));
    const objectOrder = Object.values(objectsById).sort((a, b) => a.zIndex - b.zIndex).map(({ id }) => id);
    return { ...history(state), objectsById, objectOrder };
  }),
  toggleSelectedLock: () => set((state) => ({ ...history(state), objectsById: Object.fromEntries(Object.entries(state.objectsById).map(([id, object]) => [id, state.selectedIds.includes(id) ? { ...object, locked: !object.locked } : object])) })),
  addAsset: (asset) => set((state) => ({ assets: { ...state.assets, [asset.id]: asset } })),
  refreshBoardTasks: (tasks) => set((state) => {
    const lookup = new Map(tasks.map((task) => [task.id, task]));
    let changed = false;
    const objectsById = Object.fromEntries(Object.entries(state.objectsById).map(([id, object]) => {
      if (object.type !== "BOARD_TASK_REFERENCE") return [id, object];
      const source = lookup.get(object.data.sourceTaskId);
      const data: BoardTaskReferenceObject["data"] = source ? { sourceTaskId: source.id, title: source.title, description: source.description ?? "", priority: source.priority, status: source.status, dueDate: source.dueDate, assigneeName: source.assignee?.name, unavailable: false } : { ...object.data, unavailable: true };
      if (JSON.stringify(data) !== JSON.stringify(object.data)) changed = true;
      return [id, { ...object, data }];
    }));
    return changed ? { objectsById } : state;
  }),
  undo: () => set((state) => {
    const previous = state.undoStack.at(-1); if (!previous) return state;
    return { ...snapshot(previous), undoStack: state.undoStack.slice(0, -1), redoStack: [snapshot(state), ...state.redoStack].slice(0, MINI_MAX_HISTORY), selectedIds: [], dirty: true };
  }),
  redo: () => set((state) => {
    const next = state.redoStack[0]; if (!next) return state;
    return { ...snapshot(next), undoStack: [...state.undoStack, snapshot(state)].slice(-MINI_MAX_HISTORY), redoStack: state.redoStack.slice(1), selectedIds: [], dirty: true };
  }),
}));
