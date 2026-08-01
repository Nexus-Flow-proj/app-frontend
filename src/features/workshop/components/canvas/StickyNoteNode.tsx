import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { useStickyNoteNode } from "../../hooks/useStickyNoteNode";

interface Props {
  obj: CanvasObject;
}

export const StickyNoteNode = memo(function StickyNoteNode({ obj }: Props) {
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
      id={`workshop-object-${obj.id}`}
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
        shadowBlur={10}
        shadowOffsetY={4}
        stroke={isSelected ? "#9063EB" : "rgba(15, 23, 42, 0.08)"}
        strokeWidth={isSelected ? 2.5 : 1}
        cornerRadius={6}
      />
      <Text
        x={14}
        y={14}
        width={obj.width - 28}
        height={obj.height - 28}
        text={data.content}
        fontSize={data.fontSize ?? 13}
        fill="#374151"
        wrap="word"
        lineHeight={1.5}
        fontFamily="'Geist Variable', sans-serif"
      />
    </Group>
  );
});
