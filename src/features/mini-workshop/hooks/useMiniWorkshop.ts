import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { miniWorkshopService } from "../services";

export function useMiniWorkshop(projectId: string) {
  return useApiQuery(
    QUERY_KEYS.canvas.mini(projectId),
    () => miniWorkshopService.get(projectId),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  );
}

