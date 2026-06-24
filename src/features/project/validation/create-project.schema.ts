import { z } from "zod";
import { PROJECT_LIMITS } from "../constants";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      PROJECT_LIMITS.nameMin,
      `Project name must be at least ${PROJECT_LIMITS.nameMin} characters`,
    )
    .max(
      PROJECT_LIMITS.nameMax,
      `Project name must be at most ${PROJECT_LIMITS.nameMax} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      PROJECT_LIMITS.descriptionMax,
      `Description must be at most ${PROJECT_LIMITS.descriptionMax} characters`,
    )
    .optional()
    .or(z.literal("")),
  color: z.string().min(1, "Choose a project color"),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
