import { z } from "zod";
import { ChatMessageType } from "../types";

export const chatAttachmentInputSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  fileSize: z.number().nonnegative(),
  storagePath: z.string().min(1),
});

export const sendMessageSchema = z
  .object({
    content: z.string().optional(),
    type: z
      .enum([
        ChatMessageType.STANDARD,
        ChatMessageType.ANNOUNCEMENT,
        ChatMessageType.SYSTEM,
      ])
      .optional(),
    parentMessageId: z.string().uuid().optional(),
    attachments: z.array(chatAttachmentInputSchema).max(5).optional(),
  })
  .refine(
    (data) =>
      Boolean(data.content?.trim()) ||
      (data.attachments && data.attachments.length > 0),
    {
      message: "Message must contain either text content or at least one attachment.",
      path: ["content"],
    },
  );

export type SendMessageFormValues = z.infer<typeof sendMessageSchema>;

export const editMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content cannot be empty."),
});

export type EditMessageFormValues = z.infer<typeof editMessageSchema>;
