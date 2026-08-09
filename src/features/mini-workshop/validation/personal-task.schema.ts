import { z } from "zod";

export const personalTaskSchema = z.object({
  title: z.string().trim().min(1, "Enter a task title").max(120),
  description: z.string().trim().max(500),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export type PersonalTaskDto = z.infer<typeof personalTaskSchema>;
