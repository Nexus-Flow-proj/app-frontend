import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Layer, Line, Rect, Stage, Transformer } from "react-konva";
import type Konva from "konva";
import type { Task } from "@/features/boards/types";
import { MINI_CANVAS } from "../../constants/design";
import { useMiniWorkshopStore } from "../../store/miniWorkshopStore";
import type { CanvasPoint, MiniCanvasObject, MiniConnection, MiniViewport } from "../../types";
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

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}

function normalizeStroke(points: number[][], zIndex: number): MiniCanvasObject | null {
  if (points.length < 2) return null;
  const xs = points.map((point) => point[0]); const ys = points.map((point) => point[1]);
  const x = Math.min(...xs); const y = Math.min(...ys); const width = Math.max(8, Math.max(...xs) - x); const height = Math.max(8, Math.max(...ys) - y);
  return {
    id: createMiniId("stroke"), type: "FREEHAND", x, y, width, height, rotation: 0, zIndex, groupId: null, locked: false,
    style: { fill: "transparent", stroke: "#334155", strokeWidth: 5, opacity: 1 },
    data: { points: points.map(([pointX, pointY, pressure]) => [pointX - x, pointY - y, pressure ?? 0.5]) },
  };
}

export const MiniWorkshopEditor = forwardRef<MiniWorkshopEditorHandle, MiniWorkshopEditorProps>(function MiniWorkshopEditor({ tasks, onTaskPlacement, onTemplates, onImage, onSearch, onEditObject }, ref) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const drawingLineRef = useRef<Konva.Line>(null);
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
  const [drawing, setDrawing] = useState(false);

  const objectsById = useMiniWorkshopStore((state) => state.objectsById);
  const objectOrder = useMiniWorkshopStore((state) => state.objectOrder);
  const connections = useMiniWorkshopStore((state) => state.connections);
  const assets = useMiniWorkshopStore((state) => state.assets);
  const viewport = useMiniWorkshopStore((state) => state.viewport);
  const selectedIds = useMiniWorkshopStore((state) => state.selectedIds);
  const tool = useMiniWorkshopStore((state) => state.activeTool);
  const shape = useMiniWorkshopStore((state) => state.activeShape);
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

  const createAt = useCallback((point: CanvasPoint) => {
    const zIndex = objectOrder.length ? Math.max(...objectOrder.map((id) => objectsById[id]?.zIndex ?? 0)) + 1 : 1;
    if (tool === "shape") addObjects([createShapeObject({ x: point.x - 110, y: point.y - 70 }, shape, zIndex)]);
    if (tool === "text") addObjects([createTextObject({ x: point.x - 130, y: point.y - 46 }, zIndex)]);
    if (tool === "sticky") addObjects([createStickyObject({ x: point.x - 110, y: point.y - 110 }, zIndex)]);
    if (tool === "frame") addObjects([createFrameObject({ x: point.x - 310, y: point.y - 210 }, zIndex)]);
    if (["shape", "text", "sticky", "frame"].includes(tool)) setTool("select");
    if (tool === "task") { onTaskPlacement(point); setTool("select"); }
  }, [addObjects, objectOrder, objectsById, onTaskPlacement, setTool, shape, tool]);

  const handleStagePointerDown = useCallback((event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "eraser") {
      const point = pointer();
      const stroke = [...objectOrder].reverse().map((id) => objectsById[id]).find((object) => object?.type === "FREEHAND" && pointInObject(point, object));
      if (stroke) deleteObjects([stroke.id]);
      return;
    }
    if (event.target !== event.target.getStage()) return;
    const point = pointer();
    if (["shape", "text", "sticky", "frame", "task"].includes(tool)) { createAt(point); return; }
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
    if (drawing && tool === "freehand") {
      drawingPointsRef.current.push(point.x, point.y, 0.5);
      drawingPreviewPointsRef.current.push(point.x, point.y);
      drawingLineRef.current?.points(drawingPreviewPointsRef.current); drawingLineRef.current?.getLayer()?.batchDraw();
    }
    if (marquee) setMarquee((current) => current ? { ...current, current: point } : null);
  }, [drawing, marquee, pointer, tool]);

  const handleStagePointerUp = useCallback(() => {
    if (drawing) {
      const grouped: number[][] = [];
      for (let index = 0; index < drawingPointsRef.current.length; index += 3) grouped.push(drawingPointsRef.current.slice(index, index + 3));
      const object = normalizeStroke(grouped, objectOrder.length + 1); if (object) addObjects([object]);
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
  }, [addObjects, drawing, marquee, objectOrder, objectsById, select]);

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
      if (event.key === "Escape") { setTool("select"); select([]); setConnectorSource(null); return; }
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

  return <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#f8f7fc] dark:bg-[#0b0912]">
    <Stage ref={stageRef} width={size.width} height={size.height} x={viewport.x} y={viewport.y} scaleX={viewport.scale} scaleY={viewport.scale} draggable={tool === "pan"} onDragEnd={handleStageDragEnd} onWheel={handleWheel} onMouseDown={handleStagePointerDown} onTouchStart={handleStagePointerDown} onMouseMove={handleStagePointerMove} onTouchMove={handleStagePointerMove} onMouseUp={handleStagePointerUp} onTouchEnd={handleStagePointerUp}>
      <Layer listening={false}><CanvasBackground bounds={backgroundBounds} dark={darkCanvas} scale={viewport.scale} /></Layer>
      <Layer id="mini-connection-layer" listening={false}><ConnectionLayer connections={connections} objectsById={objectsById} /></Layer>
      <Layer>{visibleObjects.map((object) => <MiniCanvasNode key={object.id} object={object} asset={object.type === "IMAGE" ? assets[object.data.assetId] : undefined} interactionKey={`${tool}:${connectorSourceId ?? ""}:${viewport.scale}:${objectOrder.length}`} selected={selectedIds.includes(object.id)} connecting={connectorSourceId === object.id} onSelect={(event) => handleObjectSelect(object, event)} onOpen={() => object.type !== "FREEHAND" && onEditObject(object)} onDragMove={(x, y) => { smartPosition(object, x, y); refreshLiveConnections(); }} onDragEnd={(x, y) => { const position = smartPosition(object, x, y, false); hideGuides(); updateObject(object.id, position as Partial<MiniCanvasObject>); }} />)}</Layer>
      <Layer><Line ref={verticalGuideRef} points={[]} stroke={MINI_CANVAS.guide} strokeWidth={1 / viewport.scale} dash={[6 / viewport.scale, 4 / viewport.scale]} visible={false} listening={false} /><Line ref={horizontalGuideRef} points={[]} stroke={MINI_CANVAS.guide} strokeWidth={1 / viewport.scale} dash={[6 / viewport.scale, 4 / viewport.scale]} visible={false} listening={false} /><Line ref={drawingLineRef} points={[]} stroke="#334155" strokeWidth={5} lineCap="round" lineJoin="round" listening={false} />{marqueeRect && <Rect {...marqueeRect} fill="rgba(139, 92, 246, 0.10)" stroke="#8b5cf6" strokeWidth={1.5 / viewport.scale} dash={[6 / viewport.scale, 4 / viewport.scale]} listening={false} />}<Transformer ref={transformerRef} visible={tool === "select"} listening={tool === "select"} rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"]} borderStroke="#8b5cf6" anchorFill="#ffffff" anchorStroke="#8b5cf6" anchorSize={9} boundBoxFunc={(oldBox, newBox) => newBox.width < 40 || newBox.height < 32 ? oldBox : newBox} onTransform={refreshLiveConnections} onTransformEnd={handleTransformEnd} /></Layer>
    </Stage>
    <SelectionToolbar />
    <MiniWorkshopToolbar tool={tool} canUndo={canUndo} canRedo={canRedo} onTool={setTool} onShape={setShape} onTemplates={onTemplates} onImage={onImage} onSearch={onSearch} onUndo={undo} onRedo={redo} />
    <div className="pointer-events-none absolute bottom-5 left-5 rounded-full border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">{objectOrder.length} objects · {connections.length} links · {Math.round(viewport.scale * 100)}%</div>
  </div>;
});
