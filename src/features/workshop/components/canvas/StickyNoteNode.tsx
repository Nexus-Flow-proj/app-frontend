import { Group, Rect, Text } from "react-konva";
import type { CanvasObject, StickyNoteData } from "../../types";
import { useWorkshopStore } from "../../store/workshopStore";

interface Props {
  obj: CanvasObject;
  onOpen?: (objectId: string) => void;
}

export function StickyNoteNode({ obj, onOpen }: Props) {
  const data = obj.data as StickyNoteData;
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const moveObject = useWorkshopStore((s) => s.moveObject);
  const startConnect = useWorkshopStore((s) => s.startConnect);
  const finishConnect = useWorkshopStore((s) => s.finishConnect);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const isSelected = selectedObjectId === obj.id;

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
      rotation={obj.rotation}
      draggable={activeTool === "select"}
      onClick={handleClick}
      onDblClick={() => activeTool === "select" && onOpen?.(obj.id)}
      onDragEnd={(e) => moveObject(obj.id, { x: e.target.x(), y: e.target.y() })}
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
}
