import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  roleId: z.string().min(1, "Choose a project role"),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
