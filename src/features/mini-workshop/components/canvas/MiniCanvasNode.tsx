import { memo, useEffect, useMemo, useState } from "react";
import { getStroke } from "perfect-freehand";
import { Circle, Ellipse, Group, Image, Path, Rect, RegularPolygon, Text } from "react-konva";
import type Konva from "konva";
import type { MiniCanvasObject, MiniImageAsset } from "../../types";

interface MiniCanvasNodeProps {
  object: MiniCanvasObject;
  asset?: MiniImageAsset;
  interactionKey: string;
  selected: boolean;
  connecting: boolean;
  onSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onOpen: () => void;
}

const FONT = "Geist Variable";
const SELECTED_STROKE = "#9063EB";
const RESTING_STROKE = "rgba(15, 23, 42, 0.08)";
const SELECTED_STROKE_WIDTH = 2.5;

function strokePath(points: number[][]) {
  if (points.length < 2) return "";
  const outline = getStroke(points, { size: 5, thinning: 0.55, smoothing: 0.65, streamline: 0.55, easing: (value) => value, simulatePressure: true });
  if (!outline.length) return "";
  const average = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let path = `M ${outline[0][0]} ${outline[0][1]} Q`;
  for (let index = 1; index < outline.length - 1; index += 1) {
    const point = outline[index]; const next = average(point, outline[index + 1]);
    path += ` ${point[0]} ${point[1]} ${next[0]} ${next[1]}`;
  }
  return `${path} Z`;
}

function useAssetImage(asset?: MiniImageAsset) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!asset) return;
    const element = new window.Image();
    element.onload = () => setImage(element);
    element.src = asset.dataUrl;
    return () => { element.onload = null; };
  }, [asset]);
  return image;
}

function NodeContent({ object, asset, selected }: { object: MiniCanvasObject; asset?: MiniImageAsset; selected: boolean }) {
  const image = useAssetImage(asset);
  const freehandPath = useMemo(() => object.type === "FREEHAND" ? strokePath(object.data.points) : "", [object]);
  const common = {
    width: object.width,
    height: object.height,
    fill: object.style.fill,
    stroke: selected ? SELECTED_STROKE : object.style.stroke,
    strokeWidth: selected ? SELECTED_STROKE_WIDTH : object.style.strokeWidth,
    dash: selected ? undefined : object.style.dash,
    opacity: object.style.opacity,
    shadowColor: "#0f172a",
    shadowBlur: 12,
    shadowOpacity: 0.1,
    shadowOffsetY: 4,
  };
  const text = { fontFamily: FONT, fill: object.style.textColor ?? "#1e293b", fontSize: object.style.fontSize ?? 18, fontStyle: object.style.fontWeight && object.style.fontWeight >= 600 ? "bold" : "normal", align: object.style.textAlign ?? "left" as const };

  if (object.type === "SHAPE") {
    const shape = object.data.shape;
    const geometry = shape === "ellipse"
      ? <Ellipse x={object.width / 2} y={object.height / 2} radiusX={object.width / 2} radiusY={object.height / 2} {...common} />
      : shape === "diamond"
        ? <RegularPolygon x={object.width / 2} y={object.height / 2} sides={4} radius={Math.min(object.width, object.height) / 1.45} scaleX={object.width / Math.max(object.height, 1)} {...common} />
        : shape === "triangle"
          ? <RegularPolygon x={object.width / 2} y={object.height / 2} sides={3} radius={Math.min(object.width, object.height) / 1.45} {...common} />
          : <Rect {...common} cornerRadius={shape === "rounded-rectangle" ? 18 : 2} />;
    return <>{geometry}<Text x={18} y={16} width={object.width - 36} height={object.height - 32} text={object.data.text ?? ""} verticalAlign="middle" {...text} /></>;
  }
  if (object.type === "TEXT") return <>
    {selected && <Rect width={object.width} height={object.height} fill="transparent" stroke={SELECTED_STROKE} strokeWidth={SELECTED_STROKE_WIDTH} cornerRadius={6} />}
    <Text width={object.width} height={object.height} text={object.data.text} verticalAlign="middle" wrap="word" {...text} />
  </>;
  if (object.type === "STICKY_NOTE") return <>
    <Rect
      width={object.width}
      height={object.height}
      fill={object.style.fill}
      shadowColor="rgba(15, 23, 42, 0.18)"
      shadowBlur={10}
      shadowOffsetY={4}
      stroke={selected ? SELECTED_STROKE : RESTING_STROKE}
      strokeWidth={selected ? SELECTED_STROKE_WIDTH : 1}
      opacity={object.style.opacity}
      cornerRadius={6}
    />
    <Text
      x={14}
      y={14}
      width={object.width - 28}
      height={object.height - 28}
      text={object.data.text}
      fontSize={object.style.fontSize ?? 13}
      fill={object.style.textColor ?? "#374151"}
      wrap="word"
      lineHeight={1.5}
      fontFamily={FONT}
      fontStyle={object.style.fontWeight && object.style.fontWeight >= 600 ? "bold" : "normal"}
      align={object.style.textAlign ?? "left"}
    />
  </>;
  if (object.type === "FRAME") return <><Rect {...common} cornerRadius={20} /><Text x={20} y={-38} width={object.width - 40} height={32} text={object.data.title} fontFamily={FONT} fontStyle="bold" fontSize={20} fill={object.style.stroke} /></>;
  if (object.type === "IMAGE") return <>
    <Rect {...common} stroke={object.style.stroke} strokeWidth={object.style.strokeWidth} dash={object.style.dash} cornerRadius={14} />
    {image ? <Image image={image} width={object.width} height={object.height} cornerRadius={14} /> : <Text width={object.width} height={object.height} text="Loading image…" verticalAlign="middle" {...text} align="center" />}
    {selected && <Rect width={object.width} height={object.height} fill="transparent" stroke={SELECTED_STROKE} strokeWidth={SELECTED_STROKE_WIDTH} cornerRadius={14} />}
  </>;
  if (object.type === "FREEHAND") return <>
    {selected && <Path data={freehandPath} fill="transparent" stroke={SELECTED_STROKE} strokeWidth={SELECTED_STROKE_WIDTH} opacity={0.9} perfectDrawEnabled={false} />}
    <Path data={freehandPath} fill={object.style.stroke} opacity={object.style.opacity} perfectDrawEnabled={false} />
  </>;

  const isBoard = object.type === "BOARD_TASK_REFERENCE";
  const unavailable = isBoard && object.data.unavailable;
  const title = object.data.title;
  const description = object.data.description;
  return <>
    <Rect {...common} fill={unavailable ? "#f1f5f9" : object.style.fill} cornerRadius={16} />
    <Rect x={0} y={0} width={6} height={object.height} fill={unavailable ? "#94a3b8" : isBoard ? "#8b5cf6" : "#22c55e"} cornerRadius={[16, 0, 0, 16]} />
    <Text x={22} y={18} width={object.width - 44} height={26} text={unavailable ? "Unavailable Board task" : isBoard ? "BOARD TASK" : "PERSONAL TASK"} fontFamily={FONT} fontSize={11} fontStyle="bold" fill={unavailable ? "#64748b" : "#7c3aed"} />
    <Text x={22} y={48} width={object.width - 44} height={50} text={title} fontFamily={FONT} fontSize={19} fontStyle="bold" fill="#1e293b" wrap="word" />
    <Text x={22} y={103} width={object.width - 44} height={45} text={description || (isBoard ? `${object.data.priority} · ${object.data.status}` : "No description")} fontFamily={FONT} fontSize={13} fill="#64748b" wrap="word" />
    {object.locked && <Circle x={object.width - 18} y={18} radius={4} fill="#8b5cf6" />}
  </>;
}

function MiniCanvasNodeComponent({ object, asset, selected, connecting, onSelect, onDragMove, onDragEnd, onOpen }: MiniCanvasNodeProps) {
  const dragBoundFunc = useMemo(() => object.locked ? () => ({ x: object.x, y: object.y }) : undefined, [object.locked, object.x, object.y]);
  return <Group
    id={`mini-object-${object.id}`}
    name="mini-object"
    x={object.x} y={object.y} rotation={object.rotation}
    draggable={!object.locked}
    dragBoundFunc={dragBoundFunc}
    onClick={onSelect} onTap={onSelect}
    onDblClick={onOpen} onDblTap={onOpen}
    onDragMove={(event) => onDragMove(event.target.x(), event.target.y())}
    onDragEnd={(event) => onDragEnd(event.target.x(), event.target.y())}
  >
    <NodeContent object={object} asset={asset} selected={selected} />
    {connecting && <Rect x={-5} y={-5} width={object.width + 10} height={object.height + 10} stroke="#22d3ee" strokeWidth={2} dash={[6, 5]} cornerRadius={16} listening={false} />}
  </Group>;
}

export const MiniCanvasNode = memo(MiniCanvasNodeComponent, (previous, next) => previous.object === next.object && previous.asset === next.asset && previous.selected === next.selected && previous.connecting === next.connecting && previous.interactionKey === next.interactionKey);
