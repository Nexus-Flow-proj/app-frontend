import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { ChatMessage, SendMessageDto } from "../types";

export function useSendMessage(projectId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<ChatMessage, SendMessageDto>(
    (dto) => chatService.sendMessage(projectId, dto),
    {
      showSuccessToast: false,
      showErrorToast: true,
      onSuccess: () => {
        // Socket event will also deliver the message, but invalidate/refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.messages(projectId),
        });
      },
    },
  );
}
