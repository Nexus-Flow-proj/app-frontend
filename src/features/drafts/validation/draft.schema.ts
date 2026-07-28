import { z } from "zod";
import {
  CUSTOM_OPTION_VALUE,
  DEFAULT_DRAFT_COLOR,
  DRAFT_LIMITS,
  MARKETING_AUDIENCE_OPTIONS,
  MARKETING_CHANNEL_OPTIONS,
  PROGRAMMING_LANGUAGE_OPTIONS,
  PROGRAMMING_TARGET_STACK_OPTIONS,
  DESIGN_DELIVERABLE_OPTIONS,
  DESIGN_TOOL_OPTIONS,
  ProjectCategory,
} from "../constants";

const constraintSelect = z.string().trim().min(1, "Choose an option");
const customConstraint = z.string().trim().optional();

export const createDraftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        DRAFT_LIMITS.titleMin,
        `Name must be at least ${DRAFT_LIMITS.titleMin} characters`,
      )
      .max(
        DRAFT_LIMITS.titleMax,
        `Name must be at most ${DRAFT_LIMITS.titleMax} characters`,
      ),
    description: z
      .string()
      .trim()
      .min(
        DRAFT_LIMITS.descriptionMin,
        `Description must be at least ${DRAFT_LIMITS.descriptionMin} characters`,
      )
      .max(
        DRAFT_LIMITS.descriptionMax,
        `Description must be at most ${DRAFT_LIMITS.descriptionMax} characters`,
      ),
    color: z.string().trim().min(1, "Choose a draft color"),
    category: z.enum(ProjectCategory),

    targetStack: constraintSelect,
    customTargetStack: customConstraint,
    preferredLanguage: constraintSelect,
    customPreferredLanguage: customConstraint,

    marketingChannels: constraintSelect,
    customMarketingChannels: customConstraint,
    targetAudience: constraintSelect,
    customTargetAudience: customConstraint,

    designDeliverables: constraintSelect,
    customDesignDeliverables: customConstraint,
    designTools: constraintSelect,
    customDesignTools: customConstraint,
    generalFocus: customConstraint,
    generalContext: customConstraint,

    estimatedTimeWeeks: z
      .number({
        error: "Enter an estimated timeline in weeks",
      })
      .int("Use a whole number of weeks")
      .min(DRAFT_LIMITS.estimatedTimeMin, "Use at least 1 week")
      .max(
        DRAFT_LIMITS.estimatedTimeMax,
        `Use ${DRAFT_LIMITS.estimatedTimeMax} weeks or less`,
      ),
  })
  .superRefine((values, ctx) => {
    const customFieldsByCategory = {
      [ProjectCategory.PROGRAMMING]: [
        ["targetStack", "customTargetStack", "target stack"],
        ["preferredLanguage", "customPreferredLanguage", "preferred language"],
      ],
      [ProjectCategory.MARKETING]: [
        ["marketingChannels", "customMarketingChannels", "marketing channels"],
        ["targetAudience", "customTargetAudience", "target audience"],
      ],
      [ProjectCategory.DESIGN]: [
        ["designDeliverables", "customDesignDeliverables", "design deliverables"],
        ["designTools", "customDesignTools", "design tools"],
      ],
      [ProjectCategory.GENERAL]: [],
    } as const;

    customFieldsByCategory[values.category].forEach(
      ([selectField, customField, label]) => {
        if (values[selectField] !== CUSTOM_OPTION_VALUE) {
          return;
        }

        const value = values[customField]?.trim() ?? "";

        if (value.length < DRAFT_LIMITS.customConstraintMin) {
          ctx.addIssue({
            code: "custom",
            path: [customField],
            message: `Write the custom ${label}`,
          });
        }

        if (value.length > DRAFT_LIMITS.customConstraintMax) {
          ctx.addIssue({
            code: "custom",
            path: [customField],
            message: `Custom ${label} must be ${DRAFT_LIMITS.customConstraintMax} characters or less`,
          });
        }
      },
    );

    if (values.category === ProjectCategory.GENERAL) {
      const generalFields = [
        ["generalFocus", "project focus"],
        ["generalContext", "project context"],
      ] as const;

      generalFields.forEach(([field, label]) => {
        const value = values[field]?.trim() ?? "";

        if (value.length < DRAFT_LIMITS.customConstraintMin) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `Write the ${label}`,
          });
        }

        if (value.length > DRAFT_LIMITS.customConstraintMax) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `${label} must be ${DRAFT_LIMITS.customConstraintMax} characters or less`,
          });
        }
      });
    }
  });

export type CreateDraftFormValues = z.infer<typeof createDraftSchema>;

export const createDraftDefaultValues: CreateDraftFormValues = {
  name: "",
  description: "",
  color: DEFAULT_DRAFT_COLOR,
  category: ProjectCategory.PROGRAMMING,
  targetStack: PROGRAMMING_TARGET_STACK_OPTIONS[0],
  customTargetStack: "",
  preferredLanguage: PROGRAMMING_LANGUAGE_OPTIONS[0],
  customPreferredLanguage: "",
  marketingChannels: MARKETING_CHANNEL_OPTIONS[0],
  customMarketingChannels: "",
  targetAudience: MARKETING_AUDIENCE_OPTIONS[0],
  customTargetAudience: "",
  designDeliverables: DESIGN_DELIVERABLE_OPTIONS[0],
  customDesignDeliverables: "",
  designTools: DESIGN_TOOL_OPTIONS[0],
  customDesignTools: "",
  generalFocus: "",
  generalContext: "",
  estimatedTimeWeeks: 8,
};
