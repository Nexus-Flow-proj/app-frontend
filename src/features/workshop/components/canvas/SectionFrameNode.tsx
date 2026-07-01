import { Group, Rect, Text } from "react-konva";
import type { CanvasObject, SectionFrameData } from "../../types";
import { useWorkshopStore } from "../../store/workshopStore";

interface Props {
  obj: CanvasObject;
  onOpen?: (objectId: string) => void;
}

export function SectionFrameNode({ obj, onOpen }: Props) {
  const data = obj.data as SectionFrameData;
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const moveObject = useWorkshopStore((s) => s.moveObject);
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const isSelected = selectedObjectId === obj.id;

  return (
    <Group
      x={obj.x}
      y={obj.y}
      draggable={activeTool === "select"}
      onClick={() => {
        if (activeTool !== "select") return;
        selectObject(obj.id);
        onOpen?.(obj.id);
      }}
      onDblClick={() => activeTool === "select" && onOpen?.(obj.id)}
      onDragEnd={(e) => moveObject(obj.id, e.target.x(), e.target.y())}
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
