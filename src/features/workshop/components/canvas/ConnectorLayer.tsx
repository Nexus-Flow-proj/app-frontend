import { Arrow, Text, Group } from "react-konva";
import { useConnectorLayer } from "../../hooks/useConnectorLayer";

export function ConnectorLayer() {
  const { renderedConnections, deleteConnection } = useConnectorLayer();

  return (
    <>
      {renderedConnections.map(({ conn, points, midX, midY }) => {
        const { color, strokeWidth, dashed, arrowEnd } = conn.style;

        return (
          <Group key={conn.id}>
            <Arrow
              points={points}
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
