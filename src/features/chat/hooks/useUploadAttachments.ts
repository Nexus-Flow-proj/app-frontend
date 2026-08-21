import { useApiMutation } from "@/hooks/useApiMutation";
import { chatService } from "../services";
import type { UploadAttachmentsResponse } from "../types";

export function useUploadAttachments(projectId: string) {
  return useApiMutation<UploadAttachmentsResponse, File[]>(
    (files) => chatService.uploadAttachments(projectId, files),
    {
      showSuccessToast: false,
      showErrorToast: true,
    },
  );
}
