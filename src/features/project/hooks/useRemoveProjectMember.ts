import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";

interface RemoveProjectMemberVariables {
  projectId: string;
  memberId: string;
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useApiMutation<null, RemoveProjectMemberVariables>(
    ({ projectId, memberId }) => projectService.removeMember(projectId, memberId),
    {
      successMessage: "Member removed from project.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.members(variables.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.list(),
        });
      },
    },
  );
}
