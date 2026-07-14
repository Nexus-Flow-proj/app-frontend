import { Arrow, Text, Group } from "react-konva";
import { useConnectorLayer } from "../../hooks/useConnectorLayer";

export function ConnectorLayer() {
  const { renderedConnections, deleteConnection, isEditing } =
    useConnectorLayer();

  return (
    <>
      {renderedConnections.map(({ conn, points, midX, midY }) => {
        const { color, strokeWidth, type } = conn.style;
        const isArrow = type === "ARROW";
        const isDashed = type === "DASHED";

        return (
          <Group
            key={conn.id}
            listening={isEditing}
            onDblClick={() => deleteConnection(conn.id)}
          >
            <Arrow
              points={points}
              stroke={color}
              strokeWidth={strokeWidth}
              fill={isArrow ? color : "transparent"}
              dash={isDashed ? [6, 4] : undefined}
              pointerLength={isArrow ? 10 : 0}
              pointerWidth={isArrow ? 8 : 0}
              hitStrokeWidth={16}
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
