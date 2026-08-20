import { Fragment, memo } from "react";
import { Arrow, Label, Tag, Text } from "react-konva";
import type { MiniCanvasObject, MiniConnection } from "../../types";
import { connectorPoints } from "../../utils/geometry";

interface ConnectionLayerProps {
  connections: MiniConnection[];
  objectsById: Record<string, MiniCanvasObject>;
}

export const ConnectionLayer = memo(function ConnectionLayer({ connections, objectsById }: ConnectionLayerProps) {
  return <>{connections.map((connection) => {
    const source = objectsById[connection.sourceObjectId]; const target = objectsById[connection.targetObjectId];
    if (!source || !target) return null;
    const points = connectorPoints(source, target, connection.sourceAnchor, connection.targetAnchor, connection.routing);
    const middle = Math.floor(points.length / 4) * 2;
    return <Fragment key={connection.id}>
      {connection.routing === "curved" ? <Arrow id={`mini-connection-${connection.id}`} points={points} stroke={connection.stroke} fill={connection.stroke} strokeWidth={connection.strokeWidth} dash={connection.dash} tension={0.45} pointerLength={10} pointerWidth={9} listening={false} /> : <Arrow id={`mini-connection-${connection.id}`} points={points} stroke={connection.stroke} fill={connection.stroke} strokeWidth={connection.strokeWidth} dash={connection.dash} pointerLength={10} pointerWidth={9} lineJoin="round" listening={false} />}
      {connection.label && <Label x={points[middle] ?? points[0]} y={points[middle + 1] ?? points[1]} listening={false}><Tag fill="#ffffff" cornerRadius={8} shadowBlur={6} shadowOpacity={0.1} /><Text text={connection.label} fontFamily="Geist Variable" fontSize={12} fill="#475569" padding={6} /></Label>}
    </Fragment>;
  })}</>;
});
