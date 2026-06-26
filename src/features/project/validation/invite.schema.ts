import { z } from "zod";
import { ProjectRole } from "@/types";

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  roleLabel: z.enum(ProjectRole, {
    error: "Choose a project role",
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
