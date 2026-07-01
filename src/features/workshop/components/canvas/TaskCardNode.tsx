import { Circle, Group, Rect, Text } from "react-konva";
import type { CanvasObject, TaskCardData } from "../../types";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../constants";
import { useWorkshopStore } from "../../store/workshopStore";

interface Props {
  obj: CanvasObject;
  onOpen?: (objectId: string) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TaskCardNode({ obj, onOpen }: Props) {
  const data = obj.data as TaskCardData;
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const hoveredObjectId = useWorkshopStore((s) => s.hoveredObjectId);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const setHoveredObject = useWorkshopStore((s) => s.setHoveredObject);
  const moveObject = useWorkshopStore((s) => s.moveObject);
  const startConnect = useWorkshopStore((s) => s.startConnect);
  const finishConnect = useWorkshopStore((s) => s.finishConnect);
  const activeTool = useWorkshopStore((s) => s.activeTool);

  const isSelected = selectedObjectId === obj.id;
  const isHovered = hoveredObjectId === obj.id;
  const statusCfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.BACKLOG;
  const priorityCfg = PRIORITY_CONFIG[data.priority] ?? PRIORITY_CONFIG.LOW;
  const W = obj.width;
  const H = obj.height;

  const handleClick = () => {
    if (activeTool === "connect") {
      const store = useWorkshopStore.getState();
      if (store.isConnecting && store.connectFromId) finishConnect(obj.id);
      else startConnect(obj.id);
      return;
    }

    if (activeTool === "select") {
      selectObject(obj.id);
      onOpen?.(obj.id);
    }
  };

  return (
    <Group
      x={obj.x}
      y={obj.y}
      draggable={activeTool === "select"}
      onClick={handleClick}
      onDblClick={() => activeTool === "select" && onOpen?.(obj.id)}
      onMouseEnter={() => setHoveredObject(obj.id)}
      onMouseLeave={() => setHoveredObject(null)}
      onDragEnd={(e) => moveObject(obj.id, e.target.x(), e.target.y())}
    >
      <Rect
        x={2}
        y={5}
        width={W}
        height={H}
        fill="rgba(15, 23, 42, 0.08)"
        cornerRadius={8}
        listening={false}
      />
      <Rect
        width={W}
        height={H}
        fill="white"
        stroke={isSelected ? "#9063EB" : isHovered ? "#0F766E" : "#E2E8F0"}
        strokeWidth={isSelected ? 2.5 : 1.25}
        cornerRadius={8}
      />
      <Rect
        width={5}
        height={H}
        fill={priorityCfg.dot}
        cornerRadius={[8, 0, 0, 8]}
        listening={false}
      />
      <Text
        x={16}
        y={14}
        width={W - 32}
        text={data.kind ?? "Task"}
        fontSize={10}
        fontStyle="700"
        fill={priorityCfg.text}
        fontFamily="'Geist Variable', sans-serif"
        listening={false}
      />
      <Text
        x={16}
        y={33}
        width={W - 32}
        height={34}
        text={data.title}
        fontSize={14}
        fontStyle="600"
        fill="#1E293B"
        wrap="word"
        lineHeight={1.25}
        fontFamily="'Geist Variable', sans-serif"
        ellipsis
      />
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
      <Rect
        x={16}
        y={H - 34}
        width={96}
        height={20}
        fill={statusCfg.bg}
        cornerRadius={10}
        listening={false}
      />
      <Circle
        x={26}
        y={H - 24}
        radius={4}
        fill={statusCfg.dot}
        listening={false}
      />
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
      {data.dueDate && (
        <Text
          x={W - 98}
          y={H - 30}
          width={58}
          text={data.dueDate.slice(5)}
          fontSize={10}
          align="right"
          fill="#64748B"
          fontFamily="'Geist Variable', sans-serif"
          listening={false}
        />
      )}
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
            text={initials(data.assigneeName)}
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
