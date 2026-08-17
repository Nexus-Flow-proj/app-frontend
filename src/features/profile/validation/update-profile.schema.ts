import { z } from "zod";
import { PROFILE_LIMITS } from "../constants";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(
      PROFILE_LIMITS.firstNameMin,
      `First name must be at least ${PROFILE_LIMITS.firstNameMin} characters`,
    )
    .max(
      PROFILE_LIMITS.firstNameMax,
      `First name must be at most ${PROFILE_LIMITS.firstNameMax} characters`,
    ),
  lastName: z
    .string()
    .trim()
    .min(
      PROFILE_LIMITS.lastNameMin,
      `Last name must be at least ${PROFILE_LIMITS.lastNameMin} characters`,
    )
    .max(
      PROFILE_LIMITS.lastNameMax,
      `Last name must be at most ${PROFILE_LIMITS.lastNameMax} characters`,
    ),
  title: z
    .string()
    .trim()
    .max(
      PROFILE_LIMITS.titleMax,
      `Title must be at most ${PROFILE_LIMITS.titleMax} characters`,
    )
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(
      PROFILE_LIMITS.bioMax,
      `Bio must be at most ${PROFILE_LIMITS.bioMax} characters`,
    )
    .optional()
    .or(z.literal("")),
  skills: z
    .array(
      z
        .string()
        .trim()
        .max(
          PROFILE_LIMITS.skillMax,
          `Each skill must be at most ${PROFILE_LIMITS.skillMax} characters`,
        ),
    )
    .max(
      PROFILE_LIMITS.maxSkills,
      `You can add up to ${PROFILE_LIMITS.maxSkills} skills`,
    )
    .optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
