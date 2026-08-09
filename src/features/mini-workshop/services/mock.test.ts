import { beforeEach, describe, expect, it } from "vitest";
import { loadMockMiniWorkshop, saveMockMiniWorkshop } from "./mock";

describe("Mini Workshop development fallback", () => {
  beforeEach(() => localStorage.clear());

  it("seeds and reloads a version-2 native scene", () => {
    const first = loadMockMiniWorkshop("project-one").data;
    expect(first.schemaVersion).toBe(2);
    expect(first.scene.objects.length).toBeGreaterThan(0);
    const saved = saveMockMiniWorkshop("project-one", { schemaVersion: 2, revision: first.revision, scene: { ...first.scene, viewport: { x: 77, y: 31, scale: 0.6 } } }).data;
    expect(saved.revision).toBe(1);
    expect(loadMockMiniWorkshop("project-one").data.scene.viewport.x).toBe(77);
  });

  it("ignores legacy or invalid local documents", () => {
    localStorage.setItem("nexus-flow:mini-workshop:mock:v2:broken", JSON.stringify({ schemaVersion: 1 }));
    expect(loadMockMiniWorkshop("broken").data.schemaVersion).toBe(2);
  });
});
