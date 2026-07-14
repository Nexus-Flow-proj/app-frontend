import { useMemo } from "react";
import { CanvasObjectType } from "@/types/enums";
import { useWorkshopStore } from "../store/workshopStore";
import type { CanvasObject } from "../types";

function center(obj: CanvasObject) {
  return { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
}

function nearestEdgeCenters(from: CanvasObject, to: CanvasObject) {
  const fromCenter = center(from);
  const toCenter = center(to);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return {
      fromPoint: {
        x: dx >= 0 ? from.x + from.width : from.x,
        y: fromCenter.y,
      },
      toPoint: {
        x: dx >= 0 ? to.x : to.x + to.width,
        y: toCenter.y,
      },
    };
  }

  return {
    fromPoint: {
      x: fromCenter.x,
      y: dy >= 0 ? from.y + from.height : from.y,
    },
    toPoint: {
      x: toCenter.x,
      y: dy >= 0 ? to.y : to.y + to.height,
    },
  };
}

export function useConnectorLayer() {
  const objects = useWorkshopStore((s) => s.objects);
  const connections = useWorkshopStore((s) => s.connections);
  const deleteConnection = useWorkshopStore((s) => s.deleteConnection);
  const isEditing = useWorkshopStore((s) => s.isEditing);

  const renderedConnections = useMemo(() => {
    const objMap = Object.fromEntries(objects.map((obj) => [obj.id, obj]));

    return connections
      .map((conn) => {
        const from = objMap[conn.fromObjectId];
        const to = objMap[conn.toObjectId];
        if (
          !from ||
          !to ||
          from.type !== CanvasObjectType.SECTION_FRAME ||
          to.type !== CanvasObjectType.SECTION_FRAME
        ) {
          return null;
        }

        const { fromPoint, toPoint } = nearestEdgeCenters(from, to);

        return {
          conn,
          points: [fromPoint.x, fromPoint.y, toPoint.x, toPoint.y],
          midX: (fromPoint.x + toPoint.x) / 2,
          midY: (fromPoint.y + toPoint.y) / 2,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [connections, objects]);

  return {
    renderedConnections,
    deleteConnection,
    isEditing,
  };
}
