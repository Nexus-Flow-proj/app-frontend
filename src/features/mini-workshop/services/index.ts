import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  MiniWorkshopDocument,
  SaveMiniWorkshopDto,
} from "../types";
import { miniWorkshopDocumentSchema } from "../validation/mini-workshop.schema";

function parseDocumentResponse(response: { data: ApiResponse<MiniWorkshopDocument> }) {
  return {
    ...response.data,
    data: miniWorkshopDocumentSchema.parse(response.data.data),
  };
}

export const miniWorkshopService = {
  get: async (projectId: string) => {
    const response = await api.get<ApiResponse<MiniWorkshopDocument>>(
      `/projects/${projectId}/mini-workshop`,
    );
    return parseDocumentResponse(response);
  },

  save: async (projectId: string, dto: SaveMiniWorkshopDto) => {
    const response = await api.patch<ApiResponse<MiniWorkshopDocument>>(
      `/projects/${projectId}/mini-workshop`,
      dto,
    );
    return parseDocumentResponse(response);
  },
};
