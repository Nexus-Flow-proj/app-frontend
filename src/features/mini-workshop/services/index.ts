import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  MiniWorkshopDocument,
  SaveMiniWorkshopDto,
} from "../types";
import {
  loadMockMiniWorkshop,
  saveMockMiniWorkshop,
} from "./mock";
import { miniWorkshopDocumentSchema } from "../validation/mini-workshop.schema";

const mockProjects = new Set<string>();

function isMissingEndpoint(error: unknown): boolean {
  return (
    import.meta.env.DEV &&
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    error.statusCode === 404
  );
}

export const miniWorkshopService = {
  get: async (projectId: string) => {
    try {
      const response = await api.get<ApiResponse<MiniWorkshopDocument>>(
        `/projects/${projectId}/mini-workshop`,
      );
      mockProjects.delete(projectId);
      return { ...response.data, data: miniWorkshopDocumentSchema.parse(response.data.data) };
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error;
      mockProjects.add(projectId);
      return loadMockMiniWorkshop(projectId);
    }
  },

  save: async (projectId: string, dto: SaveMiniWorkshopDto) => {
    if (mockProjects.has(projectId)) {
      return saveMockMiniWorkshop(projectId, dto);
    }

    try {
      const response = await api.patch<ApiResponse<MiniWorkshopDocument>>(
        `/projects/${projectId}/mini-workshop`,
        dto,
      );
      return { ...response.data, data: miniWorkshopDocumentSchema.parse(response.data.data) };
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error;
      mockProjects.add(projectId);
      return saveMockMiniWorkshop(projectId, dto);
    }
  },
};
