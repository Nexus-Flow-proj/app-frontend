import { describe, expect, it } from "vitest";
import { connectorPoints, screenToCanvas, snapValue, viewportBounds } from "./geometry";
import { createShapeObject } from "./objectFactory";

describe("Mini Workshop geometry", () => {
  it("converts screen coordinates and computes visible bounds", () => {
    expect(screenToCanvas({ x: 140, y: 90 }, { x: 40, y: 10, scale: 2 })).toEqual({ x: 50, y: 40 });
    expect(viewportBounds(800, 600, { x: 0, y: 0, scale: 2 }, 0)).toEqual({ x: 0, y: 0, width: 400, height: 300 });
    expect(snapValue(37)).toBe(48);
  });

  it("routes straight and elbow connections between nearest edges", () => {
    const source = createShapeObject({ x: 0, y: 0 }, "rectangle", 1);
    const target = createShapeObject({ x: 500, y: 0 }, "rectangle", 2);
    const straight = connectorPoints(source, target, "auto", "auto", "straight");
    expect(straight).toEqual([220, 70, 500, 70]);
    expect(connectorPoints(source, target, "auto", "auto", "elbow")).toHaveLength(8);
  });
});
