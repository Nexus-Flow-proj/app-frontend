import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";

export function useProjectInvitation(inviteToken?: string) {
  return useApiQuery(
    QUERY_KEYS.projects.invitation(inviteToken ?? ""),
    () => projectService.getInvite(inviteToken ?? ""),
    {
      enabled: !!inviteToken,
      retry: false,
      staleTime: 1000 * 60,
    },
  );
}
