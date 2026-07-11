import { z } from "zod";
import { PROJECT_LIMITS } from "../constants";
import {
  CUSTOM_ROLE_LEVEL_MAX,
  CUSTOM_ROLE_LEVEL_MIN,
} from "../constants/rolePresets";

const rolePermissionsSchema = z.object({
  project: z.object({
    read: z.boolean(),
    updateSettings: z.boolean(),
    deleteProject: z.boolean(),
  }),
  members: z.object({
    invite: z.boolean(),
    remove: z.boolean(),
    changeRoles: z.boolean(),
  }),
  tasks: z.object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
    assign: z.boolean(),
  }),
  workshop: z.object({
    read: z.boolean(),
    createNodes: z.boolean(),
    updateNodes: z.boolean(),
    deleteNodes: z.boolean(),
    generateWithAi: z.boolean(),
  }),
  board: z.object({
    read: z.boolean(),
    moveTasks: z.boolean(),
    manageColumns: z.boolean(),
  }),
});

export const createProjectRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Role name is required")
    .max(
      PROJECT_LIMITS.nameMax,
      `Role name must be at most ${PROJECT_LIMITS.nameMax} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      PROJECT_LIMITS.descriptionMax,
      `Description must be at most ${PROJECT_LIMITS.descriptionMax} characters`,
    )
    .optional(),
  level: z
    .number()
    .int("Hierarchy level must be a whole number")
    .min(
      CUSTOM_ROLE_LEVEL_MIN,
      `Hierarchy level must be at least ${CUSTOM_ROLE_LEVEL_MIN}`,
    )
    .max(
      CUSTOM_ROLE_LEVEL_MAX,
      `Hierarchy level must be at most ${CUSTOM_ROLE_LEVEL_MAX}`,
    ),
  permissions: rolePermissionsSchema,
});

export const updateProjectRoleSchema = createProjectRoleSchema.partial();

export type CreateProjectRoleFormValues = z.infer<
  typeof createProjectRoleSchema
>;
export type UpdateProjectRoleFormValues = z.infer<
  typeof updateProjectRoleSchema
>;
