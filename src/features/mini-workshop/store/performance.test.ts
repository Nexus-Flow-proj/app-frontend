import { describe, expect, it } from "vitest";
import type { MiniCanvasObject, MiniConnection } from "../types";
import { createMiniId, createShapeObject } from "../utils/objectFactory";
import { useMiniWorkshopStore } from "./miniWorkshopStore";

describe("Mini Workshop large-scene serialization", () => {
  it("normalizes and serializes 1,000 shapes, 200 tasks, 300 connectors, and 100 strokes", () => {
    const shapes = Array.from({ length: 1000 }, (_, index) => createShapeObject({ x: (index % 40) * 250, y: Math.floor(index / 40) * 170 }, "rounded-rectangle", index));
    const tasks: MiniCanvasObject[] = Array.from({ length: 200 }, (_, index) => ({ ...createShapeObject({ x: index * 20, y: 5000 }, "rectangle", 1000 + index), type: "PERSONAL_TASK" as const, width: 340, height: 170, data: { title: `Task ${index}`, description: "Performance fixture", completed: false } }));
    const strokes: MiniCanvasObject[] = Array.from({ length: 100 }, (_, index) => ({ id: createMiniId("stroke"), type: "FREEHAND" as const, x: index * 10, y: 6000, width: 100, height: 40, rotation: 0, zIndex: 1200 + index, groupId: null, locked: false, style: { fill: "transparent", stroke: "#334155", strokeWidth: 5, opacity: 1 }, data: { points: [[0, 0, 0.5], [50, 30, 0.6], [100, 5, 0.4]] } }));
    const connections: MiniConnection[] = Array.from({ length: 300 }, (_, index) => ({ id: createMiniId("connection"), sourceObjectId: shapes[index].id, targetObjectId: shapes[index + 1].id, sourceAnchor: "auto", targetAnchor: "auto", routing: "curved", label: "", stroke: "#8b5cf6", strokeWidth: 2 }));
    const start = performance.now();
    useMiniWorkshopStore.getState().loadScene({ viewport: { x: 0, y: 0, scale: 1 }, objects: [...shapes, ...tasks, ...strokes], connections, assets: {} });
    const serialized = JSON.stringify(useMiniWorkshopStore.getState().scene());
    expect(JSON.parse(serialized).objects).toHaveLength(1300);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});
