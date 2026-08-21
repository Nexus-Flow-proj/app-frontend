import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";

export function useRemoveReaction(projectId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<null, { messageId: string; emoji: string }>(
    ({ messageId, emoji }) =>
      chatService.removeReaction(projectId, messageId, emoji),
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
