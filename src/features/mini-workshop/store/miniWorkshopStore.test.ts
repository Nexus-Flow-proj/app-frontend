import { beforeEach, describe, expect, it } from "vitest";
import { createShapeObject } from "../utils/objectFactory";
import { useMiniWorkshopStore } from "./miniWorkshopStore";

const emptyScene = { viewport: { x: 0, y: 0, scale: 1 }, objects: [], connections: [], assets: {} };

describe("Mini Workshop store", () => {
  beforeEach(() => useMiniWorkshopStore.getState().loadScene(emptyScene));

  it("does not mark viewport movement as unsaved", () => {
    useMiniWorkshopStore.getState().setViewport({ x: 100, y: 80, scale: 0.7 });
    expect(useMiniWorkshopStore.getState().dirty).toBe(false);
    expect(useMiniWorkshopStore.getState().scene().viewport.scale).toBe(0.7);
  });

  it("commits one history snapshot and restores it", () => {
    const object = createShapeObject({ x: 0, y: 0 }, "ellipse", 1);
    useMiniWorkshopStore.getState().addObjects([object]);
    expect(useMiniWorkshopStore.getState().dirty).toBe(true);
    expect(useMiniWorkshopStore.getState().undoStack).toHaveLength(1);
    useMiniWorkshopStore.getState().undo();
    expect(useMiniWorkshopStore.getState().objectOrder).toHaveLength(0);
    useMiniWorkshopStore.getState().redo();
    expect(useMiniWorkshopStore.getState().objectOrder).toHaveLength(1);
  });

  it("duplicates selected objects with new IDs", () => {
    const object = createShapeObject({ x: 20, y: 30 }, "rectangle", 1);
    useMiniWorkshopStore.getState().addObjects([object]);
    useMiniWorkshopStore.getState().duplicateSelected();
    const state = useMiniWorkshopStore.getState();
    expect(state.objectOrder).toHaveLength(2);
    expect(new Set(state.objectOrder).size).toBe(2);
    expect(state.objectsById[state.selectedIds[0]].x).toBe(48);
  });

  it("distributes variable-size objects with equal edge-to-edge gaps", () => {
    const first = createShapeObject({ x: 0, y: 0 }, "rectangle", 1);
    const middle = createShapeObject({ x: 220, y: 40 }, "rectangle", 2);
    const last = createShapeObject({ x: 640, y: 80 }, "rectangle", 3);
    first.width = 100;
    middle.width = 240;
    last.width = 160;
    useMiniWorkshopStore.getState().addObjects([first, middle, last]);

    useMiniWorkshopStore.getState().distributeSelected("horizontal");

    const state = useMiniWorkshopStore.getState();
    const result = state.objectOrder.map((id) => state.objectsById[id]);
    expect(result.map((object) => object.x)).toEqual([0, 250, 640]);
    expect(result[1].x - (result[0].x + result[0].width)).toBe(150);
    expect(result[2].x - (result[1].x + result[1].width)).toBe(150);
  });
});
