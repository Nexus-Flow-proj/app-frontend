import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { ChatMessage, PinMessageDto } from "../types";

export function usePinMessage(projectId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<
    ChatMessage,
    { messageId: string; dto?: PinMessageDto }
  >(
    ({ messageId, dto }) => chatService.pinMessage(projectId, messageId, dto),
    {
      showSuccessToast: false,
      showErrorToast: true,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.messages(projectId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chat.pinned(projectId),
        });
      },
    },
  );
}
