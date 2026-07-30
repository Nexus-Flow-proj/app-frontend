import {
  CUSTOM_OPTION_VALUE,
  DEFAULT_DRAFT_COLOR,
  DESIGN_DELIVERABLE_OPTIONS,
  DESIGN_TOOL_OPTIONS,
  MARKETING_AUDIENCE_OPTIONS,
  MARKETING_CHANNEL_OPTIONS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  PROGRAMMING_TARGET_STACK_OPTIONS,
  ProjectCategory,
} from "../constants";
import type { DraftSummary } from "../types";
import {
  createDraftDefaultValues,
  type CreateDraftFormValues,
} from "../validation";

function parseEstimatedWeeks(value?: string) {
  if (!value) {
    return createDraftDefaultValues.estimatedTimeWeeks;
  }

  const numericValue = Number.parseInt(value, 10);

  if (Number.isNaN(numericValue)) {
    return createDraftDefaultValues.estimatedTimeWeeks;
  }

  return value.toLowerCase().includes("month")
    ? numericValue * 4
    : numericValue;
}

function selectOrCustom<T extends readonly string[]>(
  value: string | undefined,
  options: T,
  fallback: string,
) {
  if (!value) {
    return { selected: fallback, custom: "" };
  }

  if (options.includes(value)) {
    return { selected: value, custom: "" };
  }

  return { selected: CUSTOM_OPTION_VALUE, custom: value };
}

function selectListOrCustom<T extends readonly string[]>(
  value: string[] | undefined,
  options: T,
  fallback: string,
) {
  const normalizedValue = value?.filter(Boolean).join(", ") ?? "";
  return selectOrCustom(normalizedValue, options, fallback);
}

export function denormalizeDraftPayload(
  draft: DraftSummary,
): CreateDraftFormValues {
  const { projectInfo } = draft;
  const constraints = projectInfo.constraints;
  const category = constraints?.category ?? ProjectCategory.PROGRAMMING;
  const targetStack = selectListOrCustom(
    constraints?.targetStack,
    PROGRAMMING_TARGET_STACK_OPTIONS,
    createDraftDefaultValues.targetStack,
  );
  const preferredLanguage = selectOrCustom(
    constraints?.preferredLanguage,
    PROGRAMMING_LANGUAGE_OPTIONS,
    createDraftDefaultValues.preferredLanguage,
  );
  const marketingChannels = selectListOrCustom(
    constraints?.marketingChannels,
    MARKETING_CHANNEL_OPTIONS,
    createDraftDefaultValues.marketingChannels,
  );
  const targetAudience = selectOrCustom(
    constraints?.targetAudience,
    MARKETING_AUDIENCE_OPTIONS,
    createDraftDefaultValues.targetAudience,
  );
  const designDeliverables = selectListOrCustom(
    constraints?.designDeliverables,
    DESIGN_DELIVERABLE_OPTIONS,
    createDraftDefaultValues.designDeliverables,
  );
  const designTools = selectListOrCustom(
    constraints?.designTools,
    DESIGN_TOOL_OPTIONS,
    createDraftDefaultValues.designTools,
  );

  return {
    ...createDraftDefaultValues,
    name: projectInfo.name,
    description: projectInfo.description ?? "",
    color: projectInfo.color || DEFAULT_DRAFT_COLOR,
    category,
    targetStack: targetStack.selected,
    customTargetStack: targetStack.custom,
    preferredLanguage: preferredLanguage.selected,
    customPreferredLanguage: preferredLanguage.custom,
    marketingChannels: marketingChannels.selected,
    customMarketingChannels: marketingChannels.custom,
    targetAudience: targetAudience.selected,
    customTargetAudience: targetAudience.custom,
    designDeliverables: designDeliverables.selected,
    customDesignDeliverables: designDeliverables.custom,
    designTools: designTools.selected,
    customDesignTools: designTools.custom,
    generalFocus: constraints?.generalFocus?.join(", ") ?? "",
    generalContext: constraints?.generalContext ?? "",
    estimatedTimeWeeks: parseEstimatedWeeks(projectInfo.estimatedTime),
  };
}
