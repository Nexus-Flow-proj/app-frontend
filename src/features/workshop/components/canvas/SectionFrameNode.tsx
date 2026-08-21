import { memo, useEffect, useRef } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { CanvasObject } from "../../types";
import { useSectionFrameNode } from "../../hooks/useSectionFrameNode";
import { useTheme } from "@/providers/ThemeProvider";

interface Props {
  obj: CanvasObject;
}

export const SectionFrameNode = memo(function SectionFrameNode({ obj }: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    data,
    isSelected,
    isDraggable,
    handleClick,
    handleDoubleClick,
    handleDragEnd,
    handleTransformEnd,
  } = useSectionFrameNode(obj);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const frameFill = isDark ? "rgba(22, 20, 32, 0.75)" : (data.backgroundColor || "#EFF6FF");
  const frameBorder = isSelected
    ? "#9063EB"
    : isDark
      ? "rgba(167, 139, 250, 0.25)"
      : (data.borderColor || "#BFDBFE");
  const titleFill = isDark ? "#F1F5F9" : "#334155";
  const descFill = isDark ? "#94A3B8" : "#64748B";

  return (
    <>
      <Group
        ref={groupRef}
        id={`workshop-object-${obj.id}`}
        x={obj.x}
        y={obj.y}
        width={obj.width}
        height={obj.height}
        draggable={isDraggable}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={() => {
          if (groupRef.current) {
            handleTransformEnd(groupRef.current);
          }
        }}
      >
        <Rect
          width={obj.width}
          height={obj.height}
          fill={frameFill}
          stroke={frameBorder}
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
          fill={titleFill}
          fontFamily="'Geist Variable', sans-serif"
        />
        {data.description && (
          <Text
            x={16}
            y={38}
            width={Math.max(20, Math.min(obj.width - 32, 440))}
            text={data.description}
            fontSize={11}
            fill={descFill}
            fontFamily="'Geist Variable', sans-serif"
            listening={false}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 120 || newBox.height < 80) {
              return oldBox;
            }
            return newBox;
          }}
          borderStroke="#9063EB"
          borderStrokeWidth={1.5}
          anchorStroke="#9063EB"
          anchorFill="#ffffff"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
});
