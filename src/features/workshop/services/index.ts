import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  AiGeneration,
  AiMessage,
  SaveWorkshopDto,
  SubmitOnboardingResult,
  WorkshopCanvasResponseDto,
} from "../types";
import { CanvasObjectType } from "@/types/enums";

function pickDefined(
  source: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  return Object.fromEntries(
    keys
      .filter((key) => source[key] !== undefined && source[key] !== null)
      .map((key) => [key, source[key]]),
  );
}

export function sanitizeWorkshopSavePayload(
  payload: SaveWorkshopDto,
): SaveWorkshopDto {
  return {
    viewport: {
      x: payload.viewport.x,
      y: payload.viewport.y,
      scale: payload.viewport.scale,
    },
    objects: payload.objects.map((object) => {
      const allowedDataKeys =
        object.type === CanvasObjectType.SECTION_FRAME
          ? ["kind", "title", "description", "backgroundColor", "borderColor"]
          : object.type === CanvasObjectType.TASK_CARD
            ? ["kind", "title", "description", "featureId"]
            : ["kind", "content", "color", "fontSize"];

      return {
        id: object.id,
        type: object.type,
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        rotation: object.rotation,
        zIndex: object.zIndex,
        data: pickDefined(object.data, allowedDataKeys),
      };
    }),
    connections: [],
  };
}

export const workshopService = {
  getCanvas: (draftId: string) =>
    api
      .get<
        ApiResponse<WorkshopCanvasResponseDto>
      >(`/projects/onboarding/draft/${draftId}/workshop`)
      .then((r) => r.data),
  saveCanvas: (draftId: string, payload: SaveWorkshopDto) =>
    api
      .patch<
        ApiResponse<WorkshopCanvasResponseDto>
      >(`/projects/onboarding/draft/${draftId}/workshop`, sanitizeWorkshopSavePayload(payload))
      .then((r) => r.data),
  generatePlan: (draftId: string, prompt: string) =>
    api
      .post<
        ApiResponse<AiGeneration>
      >("/projects/onboarding/ai/generate", { draftId, prompt })
      .then((r) => r.data),
  getGeneration: (generationId: string) =>
    api
      .get<
        ApiResponse<AiGeneration>
      >(`/projects/onboarding/ai/generations/${generationId}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      .then((r) => r.data),
  getMessages: (draftId: string) =>
    api
      .get<
        ApiResponse<AiMessage[]>
      >(`/projects/onboarding/ai/drafts/${draftId}/messages`)
      .then((r) => r.data),
  submitDraft: (draftId: string) =>
    api
      .post<
        ApiResponse<SubmitOnboardingResult>
      >("/projects/onboarding/submit", { draftId })
      .then((r) => r.data),
};
