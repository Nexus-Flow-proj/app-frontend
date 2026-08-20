import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiResponse } from "@/types";
import type { MiniWorkshopDocument, SaveMiniWorkshopDto } from "../types";

vi.mock("@/lib/api/axios", () => ({
  api: { get: vi.fn(), patch: vi.fn() },
}));

import { api } from "@/lib/api/axios";
import { miniWorkshopService } from ".";

const document: MiniWorkshopDocument = {
  id: "mini-1",
  projectId: "project-1",
  ownerId: "user-1",
  schemaVersion: 2,
  revision: 3,
  scene: {
    viewport: { x: 40, y: 40, scale: 0.82 },
    objects: [],
    connections: [],
    assets: {},
  },
  createdAt: "2026-08-10T00:00:00.000Z",
  updatedAt: "2026-08-10T00:00:00.000Z",
};

const response: ApiResponse<MiniWorkshopDocument> = {
  success: true,
  message: "Mini Workshop loaded successfully.",
  statusCode: 200,
  data: document,
};

describe("miniWorkshopService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the authenticated member's document from the backend endpoint", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: response });

    await expect(miniWorkshopService.get("project-1")).resolves.toMatchObject({
      data: document,
    });
    expect(api.get).toHaveBeenCalledWith("/projects/project-1/mini-workshop");
  });

  it("sends the complete schema-v2 scene and revision to the backend", async () => {
    const dto: SaveMiniWorkshopDto = {
      schemaVersion: 2,
      revision: 3,
      scene: document.scene,
    };
    vi.mocked(api.patch).mockResolvedValue({
      data: { ...response, message: "Mini Workshop saved successfully.", data: { ...document, revision: 4 } },
    });

    const result = await miniWorkshopService.save("project-1", dto);

    expect(api.patch).toHaveBeenCalledWith("/projects/project-1/mini-workshop", dto);
    expect(result.data.revision).toBe(4);
  });
});
