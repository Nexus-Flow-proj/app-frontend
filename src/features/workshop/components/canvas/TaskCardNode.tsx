import { Circle, Group, Line, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { useTaskCardNode } from "../../hooks/useTaskCardNode";

interface TaskCardNodeProps {
  obj: CanvasObject;
}

export function TaskCardNode({ obj }: TaskCardNodeProps) {
  const {
    data,
    isSelected,
    isHovered,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleDragMove,
    handleDragEnd,
  } = useTaskCardNode(obj);
  const width = obj.width;
  const height = obj.height;

  return (
    <Group
      x={obj.x}
      y={obj.y}
      draggable={isDraggable}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        x={1}
        y={4}
        width={width}
        height={height}
        fill="rgba(15, 23, 42, 0.10)"
        cornerRadius={12}
        listening={false}
      />
      <Rect
        width={width}
        height={height}
        fill="#FFFFFF"
        stroke={isSelected ? "#7C3AED" : isHovered ? "#A78BFA" : "#E2E8F0"}
        strokeWidth={isSelected ? 2.5 : 1.25}
        cornerRadius={12}
        shadowColor="rgba(30, 41, 59, 0.08)"
        shadowBlur={isSelected || isHovered ? 14 : 8}
        shadowOffsetY={3}
      />
      <Rect
        width={4}
        height={height}
        fill="#8B5CF6"
        cornerRadius={[12, 0, 0, 12]}
        listening={false}
      />
      <Circle x={20} y={20} radius={5} fill="#EDE9FE" listening={false} />
      <Circle x={20} y={20} radius={2.25} fill="#7C3AED" listening={false} />
      <Text
        x={31}
        y={14}
        width={width - 48}
        text="PLANNED TASK"
        fontSize={9}
        fontStyle="700"
        fill="#7C3AED"
        letterSpacing={0.9}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      <Text
        x={18}
        y={35}
        width={width - 36}
        height={36}
        text={data.title}
        fontSize={14}
        fontStyle="600"
        fill="#1E293B"
        wrap="word"
        lineHeight={1.25}
        ellipsis
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      {data.description ? (
        <Text
          x={18}
          y={72}
          width={width - 36}
          height={28}
          text={data.description}
          fontSize={10.5}
          fill="#64748B"
          wrap="word"
          lineHeight={1.3}
          ellipsis
          fontFamily="'Geist Variable', sans-serif"
          listening={false}
        />
      ) : null}
      <Line
        points={[18, height - 34, width - 16, height - 34]}
        stroke="#F1F5F9"
        listening={false}
      />
      <Rect
        x={18}
        y={height - 27}
        width={data.dueDate ? 104 : 76}
        height={19}
        fill={data.dueDate ? "#F1F5F9" : "#F8FAFC"}
        cornerRadius={9.5}
        listening={false}
      />
      <Text
        x={25}
        y={height - 22}
        width={data.dueDate ? 92 : 64}
        text={data.dueDate ? `Due ${data.dueDate}` : "No date"}
        fontSize={9.5}
        fill={data.dueDate ? "#475569" : "#94A3B8"}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
    </Group>
  );
}
