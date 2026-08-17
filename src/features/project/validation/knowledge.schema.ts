import { z } from "zod";

export const knowledgeSourceTypeSchema = z.enum([
  "policy",
  "documentation",
  "decision",
  "guideline",
]);

export const knowledgeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please provide a title.")
    .max(255, "Title must be at most 255 characters."),
  content: z
    .string()
    .trim()
    .min(1, "Please provide rule content.")
    .max(2000, "Keep content under 2,000 characters."),
  sourceType: knowledgeSourceTypeSchema,
});

export const knowledgeSearchSchema = z.object({
  query: z.string().trim().min(1, "Enter a prompt to test retrieval."),
  limit: z.number().int().min(1).max(10),
  minSimilarity: z.number().min(0).max(1),
});

export type KnowledgeFormValues = z.infer<typeof knowledgeSchema>;
export type KnowledgeSearchFormValues = z.infer<typeof knowledgeSearchSchema>;
