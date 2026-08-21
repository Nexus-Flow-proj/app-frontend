import { memo, useEffect, useRef } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { CanvasObject } from "../../types";
import { useSectionFrameNode } from "../../hooks/useSectionFrameNode";

interface Props {
  obj: CanvasObject;
}

export const SectionFrameNode = memo(function SectionFrameNode({ obj }: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

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
            width={Math.max(20, Math.min(obj.width - 32, 440))}
            text={data.description}
            fontSize={11}
            fill="#64748B"
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
