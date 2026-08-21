import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { MarkAsReadDto, MarkAsReadResponse } from "../types";

export function useMarkAsRead(projectId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<MarkAsReadResponse, MarkAsReadDto | undefined>(
    (dto) => chatService.markAsRead(projectId, dto),
    {
      showSuccessToast: false,
      showErrorToast: false,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.unreadCount(projectId),
        });
      },
    },
  );
}
