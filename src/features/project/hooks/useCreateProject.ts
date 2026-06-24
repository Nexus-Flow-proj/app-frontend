import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useProjectStore } from "@/store";
import { projectService } from "../services";
import type { CreateProjectDto } from "../types";

export function useCreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveProject = useProjectStore((state) => state.setActiveProject);

  return useApiMutation(
    (dto: CreateProjectDto) => projectService.createProject(dto),
    {
      onSuccess: (res) => {
        setActiveProject(res.data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.list(),
        });
        queryClient.setQueryData(QUERY_KEYS.projects.detail(res.data.id), res);
        navigate(`/projects/${res.data.id}/workshop`, { replace: true });
      },
    },
  );
}
