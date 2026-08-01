import { memo } from "react";
import type Konva from "konva";
import { Group, Text } from "react-konva";
import { useWorkshopStore } from "../../store/workshopStore";
import type { CanvasObject, TextBoxData } from "../../types";

interface TextBoxNodeProps { obj: CanvasObject }

export const TextBoxNode = memo(function TextBoxNode({ obj }: TextBoxNodeProps) {
  const data = obj.data as TextBoxData;
  const activeTool = useWorkshopStore((state) => state.activeTool);
  const selected = useWorkshopStore((state) => state.selectedObjectId === obj.id);
  const selectObject = useWorkshopStore((state) => state.selectObject);
  const openObjectDetails = useWorkshopStore((state) => state.openObjectDetails);
  const moveObject = useWorkshopStore((state) => state.moveObject);

  return (
    <Group
      id={`workshop-object-${obj.id}`}
      x={obj.x}
      y={obj.y}
      draggable={activeTool === "select"}
      onClick={() => activeTool === "select" && selectObject(obj.id)}
      onDblClick={() => activeTool === "select" && openObjectDetails(obj.id)}
      onDragEnd={(event: Konva.KonvaEventObject<DragEvent>) => moveObject(obj.id, { x: event.target.x(), y: event.target.y() })}
    >
      <Text
        width={obj.width}
        height={obj.height}
        text={data.content}
        fill={data.color ?? "#334155"}
        fontSize={data.fontSize ?? 18}
        fontFamily="'Geist Variable', sans-serif"
        lineHeight={1.35}
        wrap="word"
        padding={8}
        stroke={selected ? "#7c3aed" : undefined}
        strokeWidth={selected ? 0.5 : 0}
      />
    </Group>
  );
});
