import { useMemo } from "react";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject } from "../types";

function centre(obj: CanvasObject) {
  return { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
}

export function useConnectorLayer() {
  const objects = useWorkshopStore((s) => s.objects);
  const connections = useWorkshopStore((s) => s.connections);
  const deleteConnection = useWorkshopStore((s) => s.deleteConnection);

  const renderedConnections = useMemo(() => {
    const objMap = Object.fromEntries(objects.map((obj) => [obj.id, obj]));

    return connections
      .map((conn) => {
        const from = objMap[conn.fromObjectId];
        const to = objMap[conn.toObjectId];
        if (!from || !to) return null;

        const fc = centre(from);
        const tc = centre(to);

        return {
          conn,
          points: [fc.x, fc.y, tc.x, tc.y],
          midX: (fc.x + tc.x) / 2,
          midY: (fc.y + tc.y) / 2,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [connections, objects]);

  return {
    renderedConnections,
    deleteConnection,
  };
}
