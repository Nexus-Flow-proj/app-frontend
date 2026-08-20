import { describe, expect, it } from "vitest";
import { MINI_WORKSHOP_TEMPLATES } from "./templates";
import { miniWorkshopSceneSchema } from "../validation/mini-workshop.schema";

describe("native Mini Workshop templates", () => {
  it("provides all eight branded templates with fresh valid IDs", () => {
    expect(MINI_WORKSHOP_TEMPLATES).toHaveLength(8);
    for (const template of MINI_WORKSHOP_TEMPLATES) {
      const first = template.build({ x: 100, y: 100 });
      const second = template.build({ x: 100, y: 100 });
      expect(new Set(first.objects.map(({ id }) => id)).size).toBe(first.objects.length);
      expect(first.objects[0]?.id).not.toBe(second.objects[0]?.id);
      expect(miniWorkshopSceneSchema.safeParse({ viewport: { x: 0, y: 0, scale: 1 }, ...first, assets: {} }).success).toBe(true);
    }
  });
});
