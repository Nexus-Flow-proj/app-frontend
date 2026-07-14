import { Group, Line, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { useStickyNoteNode } from "../../hooks/useStickyNoteNode";

interface Props {
  obj: CanvasObject;
}

export function StickyNoteNode({ obj }: Props) {
  const {
    data,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragEnd,
  } = useStickyNoteNode(obj);

  return (
    <Group
      x={obj.x}
      y={obj.y}
      rotation={obj.rotation}
      draggable={isDraggable}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={obj.width}
        height={obj.height}
        fill={data.color}
        shadowColor="rgba(15, 23, 42, 0.18)"
        shadowBlur={isSelected ? 18 : 12}
        shadowOffsetY={6}
        stroke={isSelected ? "#9063EB" : "rgba(15, 23, 42, 0.08)"}
        strokeWidth={isSelected ? 2.5 : 1}
        cornerRadius={10}
      />
      <Rect
        width={obj.width}
        height={7}
        fill="rgba(255, 255, 255, 0.38)"
        cornerRadius={[10, 10, 0, 0]}
        listening={false}
      />
      <Line
        points={[
          obj.width - 28,
          0,
          obj.width,
          0,
          obj.width,
          28,
        ]}
        closed
        fill="rgba(255, 255, 255, 0.48)"
        listening={false}
      />
      <Text
        x={16}
        y={22}
        width={obj.width - 32}
        height={obj.height - 38}
        text={data.content}
        fontSize={data.fontSize ?? 13}
        fill="#374151"
        wrap="word"
        lineHeight={1.5}
        fontFamily="'Geist Variable', sans-serif"
      />
    </Group>
  );
}
