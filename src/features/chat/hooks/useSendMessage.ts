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
      onSuccess: async (res) => {
        if (res.data?.id) {
          try {
            await chatService.markAsRead(projectId, { messageId: res.data.id });
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error("Error marking chat as read", err);
            }
            // Ignore error
          }
        }
        queryClient.setQueryData(QUERY_KEYS.chat.unreadCount(projectId), {
          unreadCount: 0,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.messages(projectId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.unreadCount(projectId),
        });
      },
    },
  );
}