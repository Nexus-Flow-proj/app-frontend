import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { ChatMessage, EditMessageDto } from "../types";

export function useEditMessage(projectId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<ChatMessage, { messageId: string; dto: EditMessageDto }>(
    ({ messageId, dto }) => chatService.editMessage(projectId, messageId, dto),
    {
      showSuccessToast: false,
      showErrorToast: true,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.messages(projectId),
        });
      },
    },
  );
}
