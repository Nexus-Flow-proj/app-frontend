import { memo, useMemo } from "react";
import { Circle, Group, Rect, Text } from "react-konva";
import type { CanvasObject } from "../../types";
import { TaskStatus } from "@/types/enums";
import { formatInitials } from "@/lib/format/text";
import { useTaskCardNode } from "../../hooks/useTaskCardNode";
import { useTheme } from "@/providers/ThemeProvider";

interface Props {
  obj: CanvasObject;
}

export const TaskCardNode = memo(function TaskCardNode({ obj }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

  const cardFill = isDark ? "#221F33" : "#FFFFFF";
  const cardStroke = isSelected
    ? "#9063EB"
    : isHovered
      ? isDark ? "#6366F1" : "#0F766E"
      : isDark ? "#383352" : "#E2E8F0";
  const shadowFill = isDark ? "rgba(0, 0, 0, 0.55)" : "rgba(15, 23, 42, 0.09)";
  const titleFill = isDark ? "#F1F5F9" : "#1E293B";
  const descFill = isDark ? "#94A3B8" : "#64748B";
  const kindFill = isDark ? priorityCfg.dot : priorityCfg.text;
  const dueDateFill = isDark ? "#94A3B8" : "#64748B";

  const badgeStyle = useMemo(() => {
    if (isDark) {
      switch (data.status) {
        case TaskStatus.BACKLOG:
          return { bg: "rgba(148, 163, 184, 0.18)", text: "#CBD5E1", dot: "#94A3B8" };
        case TaskStatus.TODO:
          return { bg: "rgba(59, 130, 246, 0.2)", text: "#93C5FD", dot: "#60A5FA" };
        case TaskStatus.IN_PROGRESS:
          return { bg: "rgba(144, 99, 235, 0.2)", text: "#C4B5FD", dot: "#A78BFA" };
        case TaskStatus.IN_REVIEW:
          return { bg: "rgba(249, 115, 22, 0.2)", text: "#FDBA74", dot: "#FB923C" };
        case TaskStatus.DONE:
          return { bg: "rgba(34, 197, 94, 0.2)", text: "#86EFAC", dot: "#4ADE80" };
        default:
          return { bg: "rgba(148, 163, 184, 0.18)", text: "#CBD5E1", dot: statusCfg.dot };
      }
    }
    return { bg: statusCfg.bg, text: statusCfg.text, dot: statusCfg.dot };
  }, [isDark, data.status, statusCfg]);

  const avatarBg = isDark ? "#2E2845" : "#F0EAFF";
  const avatarStroke = isDark ? "#221F33" : "white";
  const avatarText = isDark ? "#C4B5FD" : "#7A4FD4";

  return (
    <Group
      id={`workshop-object-${obj.id}`}
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
        fill={shadowFill}
        cornerRadius={8}
        listening={false}
      />
      {/* Main card rectangle: The border color changes based on state */}
      <Rect
        width={W}
        height={H}
        fill={cardFill}
        stroke={cardStroke}
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
        y={11}
        width={W - 32} // The text should not exceed the card width minus padding: means 16px padding left and 16px padding right.
        text={data.kind ?? "Task"}
        fontSize={10}
        fontStyle="700"
        fill={kindFill}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      {/* This displays the main title. */}
      <Text
        x={16}
        y={28}
        width={W - 32}
        height={22}
        text={data.title}
        fontSize={14}
        fontStyle="600"
        fill={titleFill}
        wrap="word" // Wrap text to next line if it exceeds the width.
        lineHeight={1.25}
        fontFamily="'Geist Variable', sans-serif"
        ellipsis
      />
      {/* This renders description only if it exists. */}
      {data.description && (
        <Text
          x={16}
          y={52}
          width={W - 32}
          height={20}
          text={data.description}
          fontSize={10.5}
          fill={descFill}
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
        y={H - 28}
        width={86}
        height={18}
        fill={badgeStyle.bg}
        cornerRadius={10}
        listening={false}
      />
      {/* Small colored circle inside the status badge. */}
      <Circle
        x={26}
        y={H - 19}
        radius={3.5}
        fill={badgeStyle.dot}
        listening={false}
      />
      {/* Text inside the status badge. */}
      <Text
        x={36}
        y={H - 24}
        width={70}
        text={statusCfg.label}
        fontSize={10}
        fontStyle="600"
        fill={badgeStyle.text}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      {/* This displays the due date only if it exists. */}
      {data.dueDate && (
        <Text
          x={data.assigneeName ? W - 98 : W - 70}
          y={H - 24}
          width={58}
          text={data.dueDate.slice(5)} // It removes the year.
          fontSize={10}
          align="right"
          fill={dueDateFill}
          fontFamily="'Geist Variable', sans-serif"
          listening={false}
        />
      )}
      {/* This displays the assignee name only if it exists. */}
      {data.assigneeName && (
        <>
          <Circle
            x={W - 22}
            y={H - 19}
            radius={11}
            fill={avatarBg}
            stroke={avatarStroke}
            strokeWidth={2}
            listening={false}
          />
          <Text
            x={W - 31}
            y={H - 24}
            width={18}
            align="center"
            text={formatInitials(data.assigneeName)}
            fontSize={10}
            fontStyle="700"
            fill={avatarText}
            fontFamily="'Geist Variable', sans-serif"
            listening={false}
          />
        </>
      )}
    </Group>
  );
});
