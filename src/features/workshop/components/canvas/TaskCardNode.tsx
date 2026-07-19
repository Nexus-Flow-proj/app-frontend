import { Circle, Group, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { formatInitials } from "@/lib/format/text";
import { useTaskCardNode } from "../../hooks/useTaskCardNode";

interface Props {
  obj: CanvasObject;
}

export function TaskCardNode({ obj }: Props) {
  const {
    data,
    isSelected,
    isHovered,
    statusCfg,
    priorityCfg,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleDragEnd,
  } = useTaskCardNode(obj);

  const W = obj.width;
  const H = obj.height;

  return (
    <Group
      // Every child shape inside the group is positioned relative to this point.
      x={obj.x}
      y={obj.y}
      draggable={isDraggable} // The card can be dragged only when select tool is active.
      onClick={handleClick}
      onDblClick={handleDoubleClick} // On double click, open details if select tool is active
      onMouseEnter={handleMouseEnter} // When mouse enters card, mark it as hovered.
      onMouseLeave={handleMouseLeave} // When mouse leaves, clear hover.
      onDragEnd={handleDragEnd} // When user finishes dragging, update the object position in the store.
    >
      {/* This draws a fake shadow behind the card. */}
      <Rect
        x={2}
        y={5}
        width={W}
        height={H}
        fill="rgba(15, 23, 42, 0.08)"
        cornerRadius={8}
        listening={false}
      />
      {/* Main card rectangle: The border color changes based on state */}
      <Rect
        width={W}
        height={H}
        fill="white"
        stroke={isSelected ? "#9063EB" : isHovered ? "#0F766E" : "#E2E8F0"}
        strokeWidth={isSelected ? 2.5 : 1.25}
        cornerRadius={8}
      />
      {/* This draws a small vertical stripe on the left. */}
      <Rect
        y={10}
        width={4}
        height={H - 20}
        fill={priorityCfg.dot}
        cornerRadius={[8]}
        listening={false}
      />
      {/* This displays the item kind */}
      <Text
        x={16} // The text should start after the left stripe: means 4px stripe + 12px padding = 16px.
        y={14}
        width={W - 32} // The text should not exceed the card width minus padding: means 16px padding left and 16px padding right.
        text={data.kind ?? "Task"}
        fontSize={10}
        fontStyle="700"
        fill={priorityCfg.text}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      {/* This displays the main title. */}
      <Text
        x={16}
        y={33}
        width={W - 32}
        height={34}
        text={data.title}
        fontSize={14}
        fontStyle="600"
        fill="#1E293B"
        wrap="word" // Wrap text to next line if it exceeds the width.
        lineHeight={1.25}
        fontFamily="'Geist Variable', sans-serif"
        ellipsis
      />
      {/* This renders description only if it exists. */}
      {data.description && (
        <Text
          x={16}
          y={72}
          width={W - 32}
          height={30}
          text={data.description}
          fontSize={10.5}
          fill="#64748B"
          wrap="word"
          lineHeight={1.3}
          fontFamily="'Geist Variable', sans-serif"
          ellipsis
          listening={false}
        />
      )}
      {/* This draws the badge background near the bottom-left. */}
      <Rect
        x={16}
        y={H - 34}
        width={86}
        height={20}
        fill={statusCfg.bg}
        cornerRadius={10}
        listening={false}
      />
      {/* Small colored circle inside the status badge. */}
      <Circle
        x={26}
        y={H - 24}
        radius={4}
        fill={statusCfg.dot}
        listening={false}
      />
      {/* Text inside the status badge. */}
      <Text
        x={36}
        y={H - 30}
        width={70}
        text={statusCfg.label}
        fontSize={10}
        fontStyle="600"
        fill={statusCfg.text}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      {/* This displays the due date only if it exists. */}
      {data.dueDate && (
        <Text
          x={data.assigneeName ? W - 98 : W - 70}
          y={H - 30}
          width={58}
          text={data.dueDate.slice(5)} // It removes the year.
          fontSize={10}
          align="right"
          fill="#64748B"
          fontFamily="'Geist Variable', sans-serif"
          listening={false}
        />
      )}
      {/* This displays the assignee name only if it exists. */}
      {data.assigneeName && (
        <>
          <Circle
            x={W - 22}
            y={H - 24}
            radius={13}
            fill="#F0EAFF"
            stroke="white"
            strokeWidth={2}
            listening={false}
          />
          <Text
            x={W - 31}
            y={H - 30}
            width={18}
            align="center"
            text={formatInitials(data.assigneeName)}
            fontSize={10}
            fontStyle="700"
            fill="#7A4FD4"
            fontFamily="'Geist Variable', sans-serif"
            listening={false}
          />
        </>
      )}
    </Group>
  );
}
