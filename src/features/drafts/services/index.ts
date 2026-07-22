import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  CreateDraftDto,
  DraftSummary,
  UpdateOnboardingDraftDto,
} from "../types";

const ONBOARDING_DRAFTS_ENDPOINT = "/projects/onboarding/draft";

export const draftService = {
  createDraft: (dto: CreateDraftDto) =>
    api
      .post<ApiResponse<DraftSummary>>(ONBOARDING_DRAFTS_ENDPOINT, dto)
      .then((r) => r.data),

  getDrafts: () =>
    api
      .get<ApiResponse<DraftSummary[]>>(ONBOARDING_DRAFTS_ENDPOINT)
      .then((r) => r.data),

  getDraft: (draftId: string) =>
    api
      .get<ApiResponse<DraftSummary>>(`${ONBOARDING_DRAFTS_ENDPOINT}/${draftId}`)
      .then((r) => r.data),

  updateDraft: (draftId: string, dto: UpdateOnboardingDraftDto) =>
    api
      .patch<ApiResponse<DraftSummary>>(
        `${ONBOARDING_DRAFTS_ENDPOINT}/${draftId}`,
        dto,
      )
      .then((r) => r.data),
};
