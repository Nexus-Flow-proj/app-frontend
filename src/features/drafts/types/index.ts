import type { ProjectCategory } from "../constants";

export interface ConstraintsDto {
  category?: ProjectCategory;
  targetStack?: string[];
  preferredLanguage?: string;
  marketingChannels?: string[];
  targetAudience?: string;
  designDeliverables?: string[];
  designTools?: string[];
  generalFocus?: string[];
  generalContext?: string;
}

export interface OnboardingProjectInfoDto {
  name: string;
  description?: string;
  color: string;
  estimatedTime?: string;
  constraints?: ConstraintsDto;
}

export interface SaveOnboardingDraftDto {
  projectInfo: OnboardingProjectInfoDto;
  workshopState?: Record<string, unknown>;
}

export interface UpdateOnboardingDraftDto {
  projectInfo?: OnboardingProjectInfoDto;
  workshopState?: Record<string, unknown>;
}

export type CreateDraftDto = SaveOnboardingDraftDto;

export interface DraftSummary {
  id: string;
  projectInfo: OnboardingProjectInfoDto;
  workshopState?: Record<string, unknown>;
  status?: "draft" | "planning" | "converted" | string;
  createdAt?: string;
  updatedAt?: string;
}
