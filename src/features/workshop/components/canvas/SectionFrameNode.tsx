import { Circle, Group, Line, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { useSectionFrameNode } from "../../hooks/useSectionFrameNode";

interface Props {
  obj: CanvasObject;
}

export function SectionFrameNode({ obj }: Props) {
  const {
    data,
    taskCount,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useSectionFrameNode(obj);

  return (
    <Group
      x={obj.x}
      y={obj.y}
      draggable={isDraggable}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={obj.width}
        height={obj.height}
        fill={data.backgroundColor || "#FAF9FF"}
        stroke={isSelected ? "#9063EB" : data.borderColor}
        strokeWidth={isSelected ? 2.5 : 1.25}
        cornerRadius={16}
        shadowColor="rgba(30, 41, 59, 0.12)"
        shadowBlur={isSelected ? 20 : 14}
        shadowOffsetY={6}
        shadowOpacity={0.8}
      />
      <Rect
        width={obj.width}
        height={6}
        fill={isSelected ? "#7C3AED" : data.borderColor}
        cornerRadius={[16, 16, 0, 0]}
        listening={false}
      />
      <Rect
        x={1}
        y={6}
        width={obj.width - 2}
        height={79}
        fill="rgba(255, 255, 255, 0.72)"
        cornerRadius={[0, 0, 12, 12]}
        listening={false}
      />
      <Line
        points={[16, 85, obj.width - 16, 85]}
        stroke="rgba(148, 163, 184, 0.32)"
        strokeWidth={1}
        listening={false}
      />
      <Circle
        x={22}
        y={24}
        radius={4}
        fill="#8B5CF6"
        listening={false}
      />
      <Text
        x={32}
        y={17}
        text="FEATURE"
        fontSize={10}
        fontStyle="700"
        fill="#7C3AED"
        letterSpacing={1.1}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      <Text
        x={20}
        y={38}
        width={Math.min(obj.width - 126, 440)}
        text={data.title}
        fontSize={17}
        fontStyle="600"
        fill="#1E293B"
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      {data.description && (
        <Text
          x={20}
          y={63}
          width={Math.min(obj.width - 126, 440)}
          text={data.description}
          fontSize={11}
          fill="#64748B"
          fontFamily="'Geist Variable', sans-serif"
          listening={false}
        />
      )}
      <Rect
        x={obj.width - 94}
        y={27}
        width={74}
        height={30}
        fill="rgba(124, 58, 237, 0.09)"
        cornerRadius={15}
        listening={false}
      />
      <Text
        x={obj.width - 94}
        y={36}
        width={74}
        align="center"
        text={`${taskCount} ${taskCount === 1 ? "task" : "tasks"}`}
        fontSize={10}
        fontStyle="600"
        fill="#6D28D9"
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      <Rect
        x={16}
        y={96}
        width={obj.width - 32}
        height={obj.height - 112}
        stroke="rgba(139, 92, 246, 0.16)"
        strokeWidth={1}
        dash={[5, 7]}
        cornerRadius={11}
        listening={false}
      />
    </Group>
  );
}
