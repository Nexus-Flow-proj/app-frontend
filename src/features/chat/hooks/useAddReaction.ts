import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { AddReactionDto } from "../types";

export function useAddReaction(projectId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<null, { messageId: string; dto: AddReactionDto }>(
    ({ messageId, dto }) => chatService.addReaction(projectId, messageId, dto),
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
