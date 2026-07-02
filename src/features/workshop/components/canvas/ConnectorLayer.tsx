// ============================================================
// features/workshop/components/canvas/ConnectorLayer.tsx
//
// Draws all CanvasConnections as Konva arrows.
// Renders on a dedicated Layer below node layers so
// arrows always appear behind cards but above frames.
// ============================================================

import { Arrow, Text, Group } from "react-konva";
import { useWorkshopStore } from "../../store/workshopStore";
import type { CanvasObject } from "../../types";

/** Returns the centre point of a canvas object */
function centre(obj: CanvasObject) {
  return { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
}

export function ConnectorLayer() {
  const objects = useWorkshopStore((s) => s.objects);
  const connections = useWorkshopStore((s) => s.connections);
  console.log(connections);

  const deleteConnection = useWorkshopStore((s) => s.deleteConnection);

  const objMap = Object.fromEntries(objects.map((o) => [o.id, o]));

  return (
    <>
      {connections.map((conn) => {
        const from = objMap[conn.fromObjectId];
        const to = objMap[conn.toObjectId];
        if (!from || !to) return null;

        const fc = centre(from);
        const tc = centre(to);
        const { color, strokeWidth, dashed, arrowEnd } = conn.style;

        // Midpoint for label
        const midX = (fc.x + tc.x) / 2;
        const midY = (fc.y + tc.y) / 2;

        return (
          <Group key={conn.id}>
            <Arrow
              points={[fc.x, fc.y, tc.x, tc.y]}
              stroke={color}
              strokeWidth={strokeWidth}
              fill={arrowEnd ? color : "transparent"}
              dash={dashed ? [6, 4] : undefined}
              pointerLength={arrowEnd ? 10 : 0}
              pointerWidth={arrowEnd ? 8 : 0}
              tension={0.3}
              onClick={() => deleteConnection(conn.id)}
              onDblClick={() => deleteConnection(conn.id)}
            />
            {conn.label && (
              <Text
                x={midX - 30}
                y={midY - 10}
                text={conn.label}
                fontSize={10}
                fill={color}
                fontStyle="500"
                fontFamily="'Geist Variable', sans-serif"
                listening={false}
              />
            )}
          </Group>
        );
      })}
    </>
  );
}
