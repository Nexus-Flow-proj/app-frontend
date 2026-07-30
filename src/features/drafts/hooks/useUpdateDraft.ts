import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { draftService } from "../services";
import type { UpdateOnboardingDraftDto } from "../types";

interface UpdateDraftVariables {
  draftId: string;
  dto: UpdateOnboardingDraftDto;
}

export function useUpdateDraft() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ draftId, dto }: UpdateDraftVariables) =>
      draftService.updateDraft(draftId, dto),
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.drafts.list(),
        });
        queryClient.setQueryData(QUERY_KEYS.drafts.detail(res.data.id), res);
        navigate(ROUTES.DRAFT_WORKSHOP(res.data.id), { replace: true });
      },
    },
  );
}
