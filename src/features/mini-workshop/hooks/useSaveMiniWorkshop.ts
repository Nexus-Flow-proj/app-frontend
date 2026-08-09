import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants";
import type { ApiError } from "@/types";
import { miniWorkshopService } from "../services";
import type { SaveMiniWorkshopDto } from "../types";

export function useSaveMiniWorkshop(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SaveMiniWorkshopDto) =>
      miniWorkshopService.save(projectId, dto),
    onSuccess: (response) => {
      queryClient.setQueryData(
        QUERY_KEYS.canvas.mini(projectId),
        response,
      );
      toast.success(response.message || "Mini Workshop saved.");
    },
    onError: (error: ApiError) => {
      if (error.statusCode === 409) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.canvas.mini(projectId) });
      }
      toast.error(error.message || "Could not save the Mini Workshop.");
    },
  });
}
