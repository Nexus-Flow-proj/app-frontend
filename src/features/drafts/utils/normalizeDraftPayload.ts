import { CUSTOM_OPTION_VALUE, ProjectCategory } from "../constants";
import type { CreateDraftDto, ConstraintsDto } from "../types";
import type { CreateDraftFormValues } from "../validation";

function normalizeOption(value: string, customValue?: string) {
  return value === CUSTOM_OPTION_VALUE ? customValue?.trim() ?? "" : value;
}

function toStringList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildConstraints(values: CreateDraftFormValues): ConstraintsDto {
  const constraints: ConstraintsDto = {
    category: values.category,
  };

  if (values.category === ProjectCategory.PROGRAMMING) {
    constraints.targetStack = toStringList(
      normalizeOption(values.targetStack, values.customTargetStack),
    );
    constraints.preferredLanguage = normalizeOption(
      values.preferredLanguage,
      values.customPreferredLanguage,
    );
  }

  if (values.category === ProjectCategory.MARKETING) {
    constraints.marketingChannels = toStringList(
      normalizeOption(values.marketingChannels, values.customMarketingChannels),
    );
    constraints.targetAudience = normalizeOption(
      values.targetAudience,
      values.customTargetAudience,
    );
  }

  if (values.category === ProjectCategory.DESIGN) {
    constraints.designDeliverables = toStringList(
      normalizeOption(values.designDeliverables, values.customDesignDeliverables),
    );
    constraints.designTools = toStringList(
      normalizeOption(values.designTools, values.customDesignTools),
    );
  }

  if (values.category === ProjectCategory.GENERAL) {
    constraints.generalFocus = toStringList(values.generalFocus ?? "");
    constraints.generalContext = values.generalContext?.trim();
  }

  return constraints;
}

export function normalizeDraftPayload(
  values: CreateDraftFormValues,
): CreateDraftDto {
  return {
    projectInfo: {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      color: values.color,
      estimatedTime: `${values.estimatedTimeWeeks} weeks`,
      constraints: buildConstraints(values),
    },
  };
}
