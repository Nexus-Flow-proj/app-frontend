import { Group, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { useSectionFrameNode } from "../../hooks/useSectionFrameNode";

interface Props {
  obj: CanvasObject;
}

export function SectionFrameNode({ obj }: Props) {
  const {
    data,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragEnd,
  } = useSectionFrameNode(obj);

  return (
    <Group
      x={obj.x}
      y={obj.y}
      draggable={isDraggable}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={obj.width}
        height={obj.height}
        fill={data.backgroundColor}
        stroke={isSelected ? "#9063EB" : data.borderColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        cornerRadius={8}
        dash={[8, 4]}
      />
      <Text
        x={16}
        y={14}
        text={`${data.kind ?? "Section"} / ${data.title}`}
        fontSize={13}
        fontStyle="700"
        fill="#334155"
        fontFamily="'Geist Variable', sans-serif"
      />
      {data.description && (
        <Text
          x={16}
          y={38}
          width={Math.min(obj.width - 32, 440)}
          text={data.description}
          fontSize={11}
          fill="#64748B"
          fontFamily="'Geist Variable', sans-serif"
          listening={false}
        />
      )}
    </Group>
  );
}
