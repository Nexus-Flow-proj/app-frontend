import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Textarea } from "@/components/ui/textarea";
import { Ellipse, Layer, Line, Rect, RegularPolygon, Stage, Transformer } from "react-konva";
import type Konva from "konva";
import type { Task } from "@/features/boards/types";
import { MINI_CANVAS } from "../../constants/design";
import { useMiniWorkshopStore } from "../../store/miniWorkshopStore";
import type { CanvasPoint, MiniCanvasObject, MiniConnection, MiniObjectStyle, MiniViewport, ShapeObject } from "../../types";
import { connectorPoints, intersects, objectBounds, pointInObject, screenToCanvas, snapValue, viewportBounds } from "../../utils/geometry";
import { createFrameObject, createMiniId, createShapeObject, createStickyObject, createTextObject } from "../../utils/objectFactory";
import { ConnectionLayer } from "./ConnectionLayer";
import { MiniCanvasNode } from "./MiniCanvasNode";
import { MiniWorkshopToolbar } from "../toolbar/MiniWorkshopToolbar";
import { SelectionToolbar } from "../toolbar/SelectionToolbar";
import { CanvasBackground } from "./CanvasBackground";

export interface MiniWorkshopEditorHandle {
  viewportCenter: () => CanvasPoint;
  exportPng: () => string | null;
  centerObject: (object: MiniCanvasObject) => void;
}

interface MiniWorkshopEditorProps {
  tasks: Task[];
  onTaskPlacement: (point: CanvasPoint) => void;
  onTemplates: () => void;
  onImage: () => void;
  onSearch: () => void;
  onEditObject: (object: MiniCanvasObject) => void;
}

interface Marquee {
  start: CanvasPoint;
  current: CanvasPoint;
}

interface ShapeDraft {
  start: CanvasPoint;
  current: CanvasPoint;
}

interface InlineTextEditorState {
  objectId: string;
  value: string;
}

const MIN_SHAPE_SIZE = {
  width: 40,
  height: 32,
};

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}

function shapeDraftBox(draft: ShapeDraft) {
  return {
    x: Math.min(draft.start.x, draft.current.x),
    y: Math.min(draft.start.y, draft.current.y),
    width: Math.abs(draft.current.x - draft.start.x),
    height: Math.abs(draft.current.y - draft.start.y),
  };
}

function inlineEditableText(object: MiniCanvasObject) {
  if (object.type === "SHAPE") return object.data.text ?? "";
  if (object.type === "TEXT" || object.type === "STICKY_NOTE") return object.data.text;
  return null;
}

function withoutInlineText(object: MiniCanvasObject): MiniCanvasObject {
  if (object.type === "SHAPE") return { ...object, data: { ...object.data, text: "" } };
  if (object.type === "TEXT" || object.type === "STICKY_NOTE") return { ...object, data: { text: "" } };
  return object;
}

function inlineEditorFrame(object: MiniCanvasObject, viewport: MiniViewport) {
  const base = { x: object.x, y: object.y, width: object.width, height: object.height };

  if (object.type === "SHAPE") {
    base.x += 18;
    base.y += 16;
    base.width = Math.max(24, object.width - 36);
    base.height = Math.max(24, object.height - 32);
  }

  if (object.type === "STICKY_NOTE") {
    base.x += 14;
    base.y += 14;
    base.width = Math.max(24, object.width - 28);
    base.height = Math.max(24, object.height - 28);
  }

  return {
    left: viewport.x + base.x * viewport.scale,
    top: viewport.y + base.y * viewport.scale,
    width: base.width * viewport.scale,
    height: base.height * viewport.scale,
  };
}

function shouldCenterInlineText(object: MiniCanvasObject) {
  return object.type === "SHAPE" || object.type === "TEXT";
}

function estimateInlineLineCount(value: string, frameWidth: number, fontSize: number) {
  const averageCharacterWidth = fontSize * 0.56;
  const charactersPerLine = Math.max(1, Math.floor(frameWidth / averageCharacterWidth));
  const paragraphs = value.split("\n");

  return paragraphs.reduce((total, paragraph) => {
    return total + Math.max(1, Math.ceil(paragraph.length / charactersPerLine));
  }, 0);
}

function inlineEditorPaddingTop(
  object: MiniCanvasObject,
  value: string,
  frame: ReturnType<typeof inlineEditorFrame>,
  fontSize: number,
  lineHeight: number,
) {
  if (!shouldCenterInlineText(object)) return 0;
  const lines = estimateInlineLineCount(value, frame.width, fontSize);
  return Math.max(0, (frame.height - lines * lineHeight) / 2);
}

function applyCreationStyle<T extends MiniCanvasObject>(
  object: T,
  defaultStyle: MiniObjectStyle,
): T {
  const textStyle = {
    opacity: defaultStyle.opacity,
    fontSize: defaultStyle.fontSize,
    fontWeight: defaultStyle.fontWeight,
    textAlign: defaultStyle.textAlign,
    textColor: defaultStyle.textColor,
  };

  if (object.type === "SHAPE") {
    return { ...object, style: { ...object.style, ...defaultStyle } } as T;
  }

  if (object.type === "TEXT") {
    return {
      ...object,
      style: {
        ...object.style,
        ...textStyle,
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
      },
    } as T;
  }

  if (object.type === "STICKY_NOTE" || object.type === "FRAME") {
    return {
      ...object,
      style: {
        ...object.style,
        fill: defaultStyle.fill,
        stroke: defaultStyle.stroke,
        strokeWidth: defaultStyle.strokeWidth,
        dash: defaultStyle.dash,
        ...textStyle,
      },
    } as T;
  }

  return object;
}

function ShapeDraftPreview({ object, scale }: { object: ShapeObject; scale: number }) {
  const common = {
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    fill: object.style.fill,
    stroke: object.style.stroke,
    strokeWidth: object.style.strokeWidth / scale,
    dash: [8 / scale, 5 / scale],
    opacity: 0.72,
    listening: false,
  };

  if (object.data.shape === "ellipse") {
    return (
      <Ellipse
        x={object.x + object.width / 2}
        y={object.y + object.height / 2}
        radiusX={object.width / 2}
        radiusY={object.height / 2}
        fill={common.fill}
        stroke={common.stroke}
        strokeWidth={common.strokeWidth}
        dash={common.dash}
        opacity={common.opacity}
        listening={false}
      />
    );
  }

  if (object.data.shape === "diamond") {
    return (
      <RegularPolygon
        x={object.x + object.width / 2}
        y={object.y + object.height / 2}
        sides={4}
        radius={Math.min(object.width, object.height) / 1.45}
        scaleX={object.width / Math.max(object.height, 1)}
        fill={common.fill}
        stroke={common.stroke}
        strokeWidth={common.strokeWidth}
        dash={common.dash}
        opacity={common.opacity}
        listening={false}
      />
    );
  }

  if (object.data.shape === "triangle") {
    return (
      <RegularPolygon
        x={object.x + object.width / 2}
        y={object.y + object.height / 2}
        sides={3}
        radius={Math.min(object.width, object.height) / 1.45}
        fill={common.fill}
        stroke={common.stroke}
        strokeWidth={common.strokeWidth}
        dash={common.dash}
        opacity={common.opacity}
        listening={false}
      />
    );
  }

  return <Rect {...common} cornerRadius={object.data.shape === "rounded-rectangle" ? 18 : 2} />;
}

function normalizeStroke(
  points: number[][],
  zIndex: number,
  defaultStyle: MiniObjectStyle,
): MiniCanvasObject | null {
  if (points.length < 2) return null;
  const xs = points.map((point) => point[0]); const ys = points.map((point) => point[1]);
  const x = Math.min(...xs); const y = Math.min(...ys); const width = Math.max(8, Math.max(...xs) - x); const height = Math.max(8, Math.max(...ys) - y);
  return {
    id: createMiniId("stroke"), type: "FREEHAND", x, y, width, height, rotation: 0, zIndex, groupId: null, locked: false,
    style: {
      fill: "transparent",
      stroke: defaultStyle.stroke,
      strokeWidth: Math.max(2, defaultStyle.strokeWidth * 2.5),
      dash: defaultStyle.dash,
      opacity: defaultStyle.opacity,
    },
    data: { points: points.map(([pointX, pointY, pressure]) => [pointX - x, pointY - y, pressure ?? 0.5]) },
  };
}

export const MiniWorkshopEditor = forwardRef<MiniWorkshopEditorHandle, MiniWorkshopEditorProps>(function MiniWorkshopEditor({ tasks, onTaskPlacement, onTemplates, onImage, onSearch, onEditObject }, ref) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const drawingLineRef = useRef<Konva.Line>(null);
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);
  const drawingPointsRef = useRef<number[]>([]);
  const drawingPreviewPointsRef = useRef<number[]>([]);
  const clipboardRef = useRef<{ objects: MiniCanvasObject[]; connections: MiniConnection[] } | null>(null);
  const liveFrameRef = useRef<number | null>(null);
  const viewportFrameRef = useRef<number | null>(null);
  const pendingViewportRef = useRef<MiniViewport | null>(null);
  const verticalGuideRef = useRef<Konva.Line>(null);
  const horizontalGuideRef = useRef<Konva.Line>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [shapeDraft, setShapeDraft] = useState<ShapeDraft | null>(null);
  const [inlineEditor, setInlineEditor] = useState<InlineTextEditorState | null>(null);
  const [drawing, setDrawing] = useState(false);

  const objectsById = useMiniWorkshopStore((state) => state.objectsById);
  const objectOrder = useMiniWorkshopStore((state) => state.objectOrder);
  const connections = useMiniWorkshopStore((state) => state.connections);
  const assets = useMiniWorkshopStore((state) => state.assets);
  const viewport = useMiniWorkshopStore((state) => state.viewport);
  const selectedIds = useMiniWorkshopStore((state) => state.selectedIds);
  const tool = useMiniWorkshopStore((state) => state.activeTool);
  const shape = useMiniWorkshopStore((state) => state.activeShape);
  const defaultStyle = useMiniWorkshopStore((state) => state.defaultStyle);
  const connectorSourceId = useMiniWorkshopStore((state) => state.connectorSourceId);
  const connectorRouting = useMiniWorkshopStore((state) => state.connectorRouting);
  const canUndo = useMiniWorkshopStore((state) => state.undoStack.length > 0);
  const canRedo = useMiniWorkshopStore((state) => state.redoStack.length > 0);
  const setViewport = useMiniWorkshopStore((state) => state.setViewport);
  const setTool = useMiniWorkshopStore((state) => state.setTool);
  const setShape = useMiniWorkshopStore((state) => state.setShape);
  const select = useMiniWorkshopStore((state) => state.select);
  const toggleSelection = useMiniWorkshopStore((state) => state.toggleSelection);
  const addObjects = useMiniWorkshopStore((state) => state.addObjects);
  const updateObject = useMiniWorkshopStore((state) => state.updateObject);
  const updateObjects = useMiniWorkshopStore((state) => state.updateObjects);
  const deleteObjects = useMiniWorkshopStore((state) => state.deleteObjects);
  const setConnectorSource = useMiniWorkshopStore((state) => state.setConnectorSource);
  const addConnection = useMiniWorkshopStore((state) => state.addConnection);
  const duplicateSelected = useMiniWorkshopStore((state) => state.duplicateSelected);
  const deleteSelected = useMiniWorkshopStore((state) => state.deleteSelected);
  const groupSelected = useMiniWorkshopStore((state) => state.groupSelected);
  const ungroupSelected = useMiniWorkshopStore((state) => state.ungroupSelected);
  const undo = useMiniWorkshopStore((state) => state.undo);
  const redo = useMiniWorkshopStore((state) => state.redo);
  const refreshBoardTasks = useMiniWorkshopStore((state) => state.refreshBoardTasks);

  useEffect(() => {
    const element = containerRef.current; if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: Math.max(1, entry.contentRect.width), height: Math.max(1, entry.contentRect.height) }));
    observer.observe(element); return () => observer.disconnect();
  }, []);

  useEffect(() => { refreshBoardTasks(tasks); }, [refreshBoardTasks, tasks]);

  const inlineObject = inlineEditor ? objectsById[inlineEditor.objectId] : null;
  const inlineFrame = inlineObject ? inlineEditorFrame(inlineObject, viewport) : null;
  const inlineEditorObjectId = inlineEditor?.objectId;

  useEffect(() => {
    if (!inlineEditorObjectId) return;
    requestAnimationFrame(() => inlineTextareaRef.current?.select());
  }, [inlineEditorObjectId]);

  useEffect(() => {
    const transformer = transformerRef.current; const stage = stageRef.current;
    if (!transformer || !stage) return;
    transformer.nodes(tool === "select" ? selectedIds.map((id) => stage.findOne(`#mini-object-${id}`)).filter(Boolean) as Konva.Node[] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, objectsById, tool]);

  const visibleObjects = useMemo(() => {
    const bounds = viewportBounds(size.width, size.height, viewport);
    return objectOrder.map((id) => objectsById[id]).filter((object): object is MiniCanvasObject => Boolean(object) && (selectedIds.includes(object.id) || intersects(objectBounds(object), bounds)));
  }, [objectOrder, objectsById, selectedIds, size.height, size.width, viewport]);

  const backgroundBounds = useMemo(
    () => viewportBounds(size.width, size.height, viewport, 0),
    [size.height, size.width, viewport],
  );

  const pointer = useCallback(() => {
    const stage = stageRef.current; const raw = stage?.getPointerPosition();
    return raw ? screenToCanvas(raw, pendingViewportRef.current ?? viewport) : { x: 0, y: 0 };
  }, [viewport]);

  const refreshLiveConnections = useCallback(() => {
    if (liveFrameRef.current !== null) return;
    liveFrameRef.current = requestAnimationFrame(() => {
      liveFrameRef.current = null; const stage = stageRef.current; if (!stage) return;
      const liveObjects = { ...objectsById };
      objectOrder.forEach((id) => {
        const node = stage.findOne(`#mini-object-${id}`); const object = objectsById[id];
        if (node && object) liveObjects[id] = { ...object, x: node.x(), y: node.y(), width: object.width * node.scaleX(), height: object.height * node.scaleY(), rotation: node.rotation() } as MiniCanvasObject;
      });
      connections.forEach((connection) => {
        const source = liveObjects[connection.sourceObjectId]; const target = liveObjects[connection.targetObjectId];
        const arrow = stage.findOne(`#mini-connection-${connection.id}`);
        if (source && target && arrow) arrow.setAttr("points", connectorPoints(source, target, connection.sourceAnchor, connection.targetAnchor, connection.routing));
      });
      stage.findOne("#mini-connection-layer")?.getLayer()?.batchDraw();
    });
  }, [connections, objectOrder, objectsById]);

  useEffect(() => () => {
    if (liveFrameRef.current !== null) cancelAnimationFrame(liveFrameRef.current);
    if (viewportFrameRef.current !== null) cancelAnimationFrame(viewportFrameRef.current);
  }, []);

  const smartPosition = useCallback((object: MiniCanvasObject, x: number, y: number, show = true) => {
    const threshold = 7 / viewport.scale; let bestX = threshold; let bestY = threshold; let snappedX = x; let snappedY = y; let guideX: number | null = null; let guideY: number | null = null;
    const movingX = [x, x + object.width / 2, x + object.width]; const movingY = [y, y + object.height / 2, y + object.height];
    objectOrder.forEach((id) => {
      if (id === object.id || selectedIds.includes(id)) return; const other = objectsById[id]; if (!other) return;
      const targetsX = [other.x, other.x + other.width / 2, other.x + other.width]; const targetsY = [other.y, other.y + other.height / 2, other.y + other.height];
      movingX.forEach((moving) => targetsX.forEach((target) => { const distance = Math.abs(moving - target); if (distance < bestX) { bestX = distance; snappedX = x + target - moving; guideX = target; } }));
      movingY.forEach((moving) => targetsY.forEach((target) => { const distance = Math.abs(moving - target); if (distance < bestY) { bestY = distance; snappedY = y + target - moving; guideY = target; } }));
    });
    if (show) {
      const bounds = viewportBounds(size.width, size.height, viewport, 0);
      verticalGuideRef.current?.visible(guideX !== null); if (guideX !== null) verticalGuideRef.current?.points([guideX, bounds.y, guideX, bounds.y + bounds.height]);
      horizontalGuideRef.current?.visible(guideY !== null); if (guideY !== null) horizontalGuideRef.current?.points([bounds.x, guideY, bounds.x + bounds.width, guideY]);
      verticalGuideRef.current?.getLayer()?.batchDraw();
    }
    return { x: bestX < threshold ? snappedX : snapValue(x), y: bestY < threshold ? snappedY : snapValue(y) };
  }, [objectOrder, objectsById, selectedIds, size.height, size.width, viewport]);

  const hideGuides = useCallback(() => { verticalGuideRef.current?.visible(false); horizontalGuideRef.current?.visible(false); verticalGuideRef.current?.getLayer()?.batchDraw(); }, []);

  const nextZIndex = useCallback(() => {
    return objectOrder.length ? Math.max(...objectOrder.map((id) => objectsById[id]?.zIndex ?? 0)) + 1 : 1;
  }, [objectOrder, objectsById]);

  const createAt = useCallback((point: CanvasPoint) => {
    const zIndex = nextZIndex();
    if (tool === "shape") addObjects([applyCreationStyle(createShapeObject({ x: point.x - 110, y: point.y - 70 }, shape, zIndex), defaultStyle)]);
    if (tool === "text") addObjects([applyCreationStyle(createTextObject({ x: point.x - 130, y: point.y - 46 }, zIndex), defaultStyle)]);
    if (tool === "sticky") addObjects([applyCreationStyle(createStickyObject({ x: point.x - 110, y: point.y - 110 }, zIndex), defaultStyle)]);
    if (tool === "frame") addObjects([applyCreationStyle(createFrameObject({ x: point.x - 310, y: point.y - 210 }, zIndex), defaultStyle)]);
    if (["shape", "text", "sticky", "frame"].includes(tool)) setTool("select");
    if (tool === "task") { onTaskPlacement(point); setTool("select"); }
  }, [addObjects, defaultStyle, nextZIndex, onTaskPlacement, setTool, shape, tool]);

  const shapeDraftObject = useMemo(() => {
    if (!shapeDraft) return null;
    const box = shapeDraftBox(shapeDraft);
    if (box.width < MIN_SHAPE_SIZE.width || box.height < MIN_SHAPE_SIZE.height) return null;
    const point = { x: box.x, y: box.y };
    const object = applyCreationStyle(createShapeObject(point, shape, nextZIndex()), defaultStyle);
    object.width = box.width;
    object.height = box.height;
    return object;
  }, [defaultStyle, nextZIndex, shape, shapeDraft]);

  const handleStagePointerDown = useCallback((event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "eraser") {
      const point = pointer();
      const stroke = [...objectOrder].reverse().map((id) => objectsById[id]).find((object) => object?.type === "FREEHAND" && pointInObject(point, object));
      if (stroke) deleteObjects([stroke.id]);
      return;
    }
    if (event.target !== event.target.getStage()) return;
    const point = pointer();
    if (tool === "shape") {
      select([]);
      setShapeDraft({ start: point, current: point });
      return;
    }
    if (["text", "sticky", "frame", "task"].includes(tool)) { createAt(point); return; }
    if (tool === "freehand") {
      setDrawing(true);
      drawingPointsRef.current = [point.x, point.y, 0.5];
      drawingPreviewPointsRef.current = [point.x, point.y];
      drawingLineRef.current?.points(drawingPreviewPointsRef.current);
      return;
    }
    if (tool === "select") { select([]); setMarquee({ start: point, current: point }); }
  }, [createAt, deleteObjects, objectOrder, objectsById, pointer, select, tool]);

  const handleStagePointerMove = useCallback(() => {
    const point = pointer();
    if (shapeDraft && tool === "shape") setShapeDraft((current) => current ? { ...current, current: point } : null);
    if (drawing && tool === "freehand") {
      drawingPointsRef.current.push(point.x, point.y, 0.5);
      drawingPreviewPointsRef.current.push(point.x, point.y);
      drawingLineRef.current?.points(drawingPreviewPointsRef.current); drawingLineRef.current?.getLayer()?.batchDraw();
    }
    if (marquee) setMarquee((current) => current ? { ...current, current: point } : null);
  }, [drawing, marquee, pointer, shapeDraft, tool]);

  const handleStagePointerUp = useCallback(() => {
    if (shapeDraft && shapeDraftObject) {
      addObjects([shapeDraftObject]);
      select([shapeDraftObject.id]);
      setTool("select");
    }
    if (shapeDraft) setShapeDraft(null);
    if (drawing) {
      const grouped: number[][] = [];
      for (let index = 0; index < drawingPointsRef.current.length; index += 3) grouped.push(drawingPointsRef.current.slice(index, index + 3));
      const object = normalizeStroke(grouped, objectOrder.length + 1, defaultStyle); if (object) addObjects([object]);
      drawingPointsRef.current = [];
      drawingPreviewPointsRef.current = [];
      drawingLineRef.current?.points([]);
      setDrawing(false);
    }
    if (marquee) {
      const box = { x: Math.min(marquee.start.x, marquee.current.x), y: Math.min(marquee.start.y, marquee.current.y), width: Math.abs(marquee.current.x - marquee.start.x), height: Math.abs(marquee.current.y - marquee.start.y) };
      if (box.width > 3 || box.height > 3) select(objectOrder.filter((id) => objectsById[id] && intersects(objectBounds(objectsById[id]), box)));
      setMarquee(null);
    }
  }, [addObjects, defaultStyle, drawing, marquee, objectOrder, objectsById, select, setTool, shapeDraft, shapeDraftObject]);

  const handleObjectSelect = useCallback((object: MiniCanvasObject, event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true;
    if (tool === "eraser") { if (object.type === "FREEHAND") deleteObjects([object.id]); return; }
    if (tool === "connector") {
      if (!connectorSourceId) { setConnectorSource(object.id); select([object.id]); return; }
      if (connectorSourceId !== object.id) {
        const next: MiniConnection = { id: createMiniId("connection"), sourceObjectId: connectorSourceId, targetObjectId: object.id, sourceAnchor: "auto", targetAnchor: "auto", routing: connectorRouting, label: "", stroke: "#8b5cf6", strokeWidth: 2 };
        addConnection(next); select([connectorSourceId, object.id]);
      }
      return;
    }
    if (tool !== "select") return;
    const groupIds = object.groupId ? objectOrder.filter((id) => objectsById[id]?.groupId === object.groupId) : [object.id];
    if ("shiftKey" in event.evt && event.evt.shiftKey) groupIds.forEach(toggleSelection); else select(groupIds);
  }, [addConnection, connectorRouting, connectorSourceId, deleteObjects, objectOrder, objectsById, select, setConnectorSource, toggleSelection, tool]);

  const commitInlineEdit = useCallback(() => {
    if (!inlineEditor) return;
    const object = objectsById[inlineEditor.objectId];
    if (!object) {
      setInlineEditor(null);
      return;
    }

    const value = inlineEditor.value.trim();
    if (object.type === "SHAPE") updateObject(object.id, { data: { ...object.data, text: value } } as Partial<MiniCanvasObject>);
    if (object.type === "TEXT" || object.type === "STICKY_NOTE") updateObject(object.id, { data: { text: value } } as Partial<MiniCanvasObject>);
    setInlineEditor(null);
  }, [inlineEditor, objectsById, updateObject]);

  const startInlineEdit = useCallback((object: MiniCanvasObject) => {
    const value = inlineEditableText(object);
    if (value === null || object.locked) {
      onEditObject(object);
      return;
    }

    select([object.id]);
    setTool("select");
    setInlineEditor({ objectId: object.id, value });
  }, [onEditObject, select, setTool]);

  const handleTransformEnd = useCallback(() => {
    const stage = stageRef.current; if (!stage) return;
    const updates = selectedIds.flatMap((id) => {
      const node = stage.findOne(`#mini-object-${id}`); const object = objectsById[id];
      if (!node || !object) return [];
      const scaleX = node.scaleX(); const scaleY = node.scaleY();
      node.scaleX(1); node.scaleY(1);
      return [{ id, patch: { x: snapValue(node.x()), y: snapValue(node.y()), width: Math.max(40, object.width * scaleX), height: Math.max(32, object.height * scaleY), rotation: node.rotation() } as Partial<MiniCanvasObject> }];
    });
    updateObjects(updates);
  }, [objectsById, selectedIds, updateObjects]);

  const handleWheel = useCallback((event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault(); const stage = stageRef.current; const mouse = stage?.getPointerPosition(); if (!mouse) return;
    const currentViewport = pendingViewportRef.current ?? viewport;
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const nextScale = Math.min(MINI_CANVAS.maxScale, Math.max(MINI_CANVAS.minScale, currentViewport.scale * (direction > 0 ? MINI_CANVAS.zoomFactor : 1 / MINI_CANVAS.zoomFactor)));
    const world = screenToCanvas(mouse, currentViewport);
    pendingViewportRef.current = { scale: nextScale, x: mouse.x - world.x * nextScale, y: mouse.y - world.y * nextScale };
    if (viewportFrameRef.current === null) viewportFrameRef.current = requestAnimationFrame(() => {
      viewportFrameRef.current = null;
      if (pendingViewportRef.current) setViewport(pendingViewportRef.current);
      pendingViewportRef.current = null;
    });
  }, [setViewport, viewport]);

  const handleStageDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const stage = stageRef.current;
    if (!stage || event.target !== stage) return;
    setViewport({ ...viewport, x: stage.x(), y: stage.y() });
  }, [setViewport, viewport]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const command = event.ctrlKey || event.metaKey;
      if (command && event.key.toLowerCase() === "k") { event.preventDefault(); onSearch(); return; }
      if (command && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
      if (command && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); return; }
      if (command && event.key.toLowerCase() === "d") { event.preventDefault(); duplicateSelected(); return; }
      if (command && event.key.toLowerCase() === "a") { event.preventDefault(); select(objectOrder); return; }
      if (command && event.key.toLowerCase() === "g") { event.preventDefault(); if (event.shiftKey) ungroupSelected(); else groupSelected(); return; }
      if (command && event.key.toLowerCase() === "c") {
        event.preventDefault(); const selected = new Set(selectedIds);
        clipboardRef.current = { objects: selectedIds.map((id) => objectsById[id]).filter(Boolean).map((object) => structuredClone(object)), connections: connections.filter((item) => selected.has(item.sourceObjectId) && selected.has(item.targetObjectId)).map((item) => structuredClone(item)) };
        return;
      }
      if (command && event.key.toLowerCase() === "x") {
        event.preventDefault(); const selected = new Set(selectedIds);
        clipboardRef.current = { objects: selectedIds.map((id) => objectsById[id]).filter(Boolean).map((object) => structuredClone(object)), connections: connections.filter((item) => selected.has(item.sourceObjectId) && selected.has(item.targetObjectId)).map((item) => structuredClone(item)) };
        deleteSelected(); return;
      }
      if (command && event.key.toLowerCase() === "v" && clipboardRef.current) {
        event.preventDefault(); const idMap = new Map<string, string>(); const groupMap = new Map<string, string>();
        const copied = clipboardRef.current.objects.map((object, index) => {
          const id = createMiniId("object"); idMap.set(object.id, id);
          if (object.groupId && !groupMap.has(object.groupId)) groupMap.set(object.groupId, createMiniId("group"));
          return { ...structuredClone(object), id, x: object.x + 32, y: object.y + 32, zIndex: objectOrder.length + index + 1, groupId: object.groupId ? groupMap.get(object.groupId)! : null } as MiniCanvasObject;
        });
        const copiedConnections = clipboardRef.current.connections.map((connection) => ({ ...structuredClone(connection), id: createMiniId("connection"), sourceObjectId: idMap.get(connection.sourceObjectId)!, targetObjectId: idMap.get(connection.targetObjectId)! }));
        clipboardRef.current = { objects: copied, connections: copiedConnections }; addObjects(copied, copiedConnections); return;
      }
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); deleteSelected(); return; }
      if (event.key === "Escape") { setTool("select"); select([]); setConnectorSource(null); setShapeDraft(null); setInlineEditor(null); return; }
      const shortcut: Record<string, typeof tool> = { v: "select", h: "pan", p: "freehand", e: "eraser", s: "shape", c: "connector", t: "text", n: "sticky", f: "frame", k: "task" };
      if (shortcut[event.key.toLowerCase()] && !command) setTool(shortcut[event.key.toLowerCase()]);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && selectedIds.length) {
        event.preventDefault(); const amount = event.shiftKey ? 10 : 1;
        updateObjects(selectedIds.map((id) => ({ id, patch: { x: (objectsById[id]?.x ?? 0) + (event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0), y: (objectsById[id]?.y ?? 0) + (event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0) } })));
      }
    };
    window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey);
  }, [addObjects, connections, deleteSelected, duplicateSelected, groupSelected, objectOrder, objectsById, onSearch, redo, select, selectedIds, setConnectorSource, setTool, tool, undo, ungroupSelected, updateObjects]);

  useImperativeHandle(ref, () => ({
    viewportCenter: () => screenToCanvas({ x: size.width / 2, y: size.height / 2 }, viewport),
    exportPng: () => stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? null,
    centerObject: (object) => {
      const scale = viewport.scale; setViewport({ ...viewport, x: size.width / 2 - (object.x + object.width / 2) * scale, y: size.height / 2 - (object.y + object.height / 2) * scale }); select([object.id]);
    },
  }), [select, setViewport, size.height, size.width, viewport]);

  const marqueeRect = marquee ? { x: Math.min(marquee.start.x, marquee.current.x), y: Math.min(marquee.start.y, marquee.current.y), width: Math.abs(marquee.current.x - marquee.start.x), height: Math.abs(marquee.current.y - marquee.start.y) } : null;
  const darkCanvas = resolvedTheme === "dark";
  const inlineFontSize = inlineObject ? (inlineObject.style.fontSize ?? 18) * viewport.scale : 18;
  const inlineLineHeight = inlineFontSize * 1.2;
  const inlinePaddingTop = inlineObject && inlineFrame && inlineEditor
    ? inlineEditorPaddingTop(inlineObject, inlineEditor.value, inlineFrame, inlineFontSize, inlineLineHeight)
    : 0;

  return <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#f8f7fc] dark:bg-[#0b0b0d]">
    <Stage ref={stageRef} width={size.width} height={size.height} x={viewport.x} y={viewport.y} scaleX={viewport.scale} scaleY={viewport.scale} draggable={tool === "pan"} onDragEnd={handleStageDragEnd} onWheel={handleWheel} onMouseDown={handleStagePointerDown} onTouchStart={handleStagePointerDown} onMouseMove={handleStagePointerMove} onTouchMove={handleStagePointerMove} onMouseUp={handleStagePointerUp} onTouchEnd={handleStagePointerUp}>
      <Layer listening={false}><CanvasBackground bounds={backgroundBounds} dark={darkCanvas} scale={viewport.scale} /></Layer>
      <Layer id="mini-connection-layer" listening={false}><ConnectionLayer connections={connections} objectsById={objectsById} /></Layer>
      <Layer>{visibleObjects.map((object) => {
        const displayObject = inlineEditor?.objectId === object.id ? withoutInlineText(object) : object;
        return <MiniCanvasNode key={object.id} object={displayObject} asset={object.type === "IMAGE" ? assets[object.data.assetId] : undefined} interactionKey={`${tool}:${connectorSourceId ?? ""}:${viewport.scale}:${objectOrder.length}:${inlineEditor?.objectId ?? ""}`} selected={selectedIds.includes(object.id)} connecting={connectorSourceId === object.id} onSelect={(event) => handleObjectSelect(object, event)} onOpen={() => object.type !== "FREEHAND" && startInlineEdit(object)} onDragMove={(x, y) => { smartPosition(object, x, y); refreshLiveConnections(); }} onDragEnd={(x, y) => { const position = smartPosition(object, x, y, false); hideGuides(); updateObject(object.id, position as Partial<MiniCanvasObject>); }} />;
      })}</Layer>
      <Layer><Line ref={verticalGuideRef} points={[]} stroke={MINI_CANVAS.guide} strokeWidth={1 / viewport.scale} dash={[6 / viewport.scale, 4 / viewport.scale]} visible={false} listening={false} /><Line ref={horizontalGuideRef} points={[]} stroke={MINI_CANVAS.guide} strokeWidth={1 / viewport.scale} dash={[6 / viewport.scale, 4 / viewport.scale]} visible={false} listening={false} /><Line ref={drawingLineRef} points={[]} stroke={defaultStyle.stroke} strokeWidth={Math.max(2, defaultStyle.strokeWidth * 2.5)} dash={defaultStyle.dash} opacity={defaultStyle.opacity} lineCap="round" lineJoin="round" listening={false} />{shapeDraftObject && <ShapeDraftPreview object={shapeDraftObject} scale={viewport.scale} />}{marqueeRect && <Rect {...marqueeRect} fill="rgba(139, 92, 246, 0.10)" stroke="#8b5cf6" strokeWidth={1.5 / viewport.scale} dash={[6 / viewport.scale, 4 / viewport.scale]} listening={false} />}<Transformer ref={transformerRef} visible={tool === "select"} listening={tool === "select"} rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"]} borderStroke="#8b5cf6" anchorFill="#ffffff" anchorStroke="#8b5cf6" anchorSize={9} boundBoxFunc={(oldBox, newBox) => newBox.width < 40 || newBox.height < 32 ? oldBox : newBox} onTransform={refreshLiveConnections} onTransformEnd={handleTransformEnd} /></Layer>
    </Stage>
    {inlineEditor && inlineObject && inlineFrame && (
      <Textarea
        ref={inlineTextareaRef}
        autoFocus
        value={inlineEditor.value}
        aria-label="Edit object text"
        className="absolute z-20 resize-none overflow-hidden border-primary/50 bg-transparent p-0 text-center shadow-none outline-none ring-0 focus-visible:ring-1 focus-visible:ring-primary"
        style={{
          left: inlineFrame.left,
          top: inlineFrame.top,
          width: inlineFrame.width,
          height: inlineFrame.height,
          minHeight: inlineFrame.height,
          paddingTop: inlinePaddingTop,
          paddingBottom: 0,
          transform: `rotate(${inlineObject.rotation}deg)`,
          transformOrigin: "center",
          fontSize: inlineFontSize,
          lineHeight: `${inlineLineHeight}px`,
          fontWeight: inlineObject.style.fontWeight ?? 500,
          color: inlineObject.style.textColor ?? "#1e293b",
          fontFamily: inlineObject.style.fontFamily ?? MINI_CANVAS.fontFamily,
          textAlign: inlineObject.style.textAlign ?? "center",
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => setInlineEditor((current) => current ? { ...current, value: event.target.value } : null)}
        onBlur={commitInlineEdit}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
    )}
    <SelectionToolbar />
    <MiniWorkshopToolbar tool={tool} activeShape={shape} canUndo={canUndo} canRedo={canRedo} onTool={setTool} onShape={setShape} onTemplates={onTemplates} onImage={onImage} onSearch={onSearch} onUndo={undo} onRedo={redo} />
    <div className="pointer-events-none absolute bottom-5 left-5 rounded-full border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">{objectOrder.length} objects · {connections.length} links · {Math.round(viewport.scale * 100)}%</div>
  </div>;
});
