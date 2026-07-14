import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants";
import { workshopService } from "../services";
import { useWorkshopStore } from "../store/workshopStore";
import { WORKSHOP_MOCK_MODE } from "../constants";

export function usePublishWorkshopPlan(projectId: string) {
  const queryClient = useQueryClient();
  const objects = useWorkshopStore((state) => state.objects);
  const connections = useWorkshopStore((state) => state.connections);
  const viewport = useWorkshopStore((state) => state.viewport);
  const publishedSnapshot = useWorkshopStore(
    (state) => state.publishedSnapshot,
  );
  const setPublishing = useWorkshopStore((state) => state.setPublishing);
  const completePublish = useWorkshopStore((state) => state.completePublish);

  return useMutation({
    mutationFn: () =>
      workshopService.publishPlanToBoard(projectId, {
        objects,
        connections,
        viewport,
        publishedSnapshot,
      }),
    onMutate: () => setPublishing(true),
    onSuccess: (result) => {
      completePublish(result.objects, result.connections, result.viewport);
      toast.success(
        WORKSHOP_MOCK_MODE
          ? "Mock canvas saved locally"
          : "Canvas saved and Team Board updated",
      );
    },
    onError: (error) => {
      setPublishing(false);
      toast.error(
        error instanceof Error ? error.message : "Could not publish the plan",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.canvas.main(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boards.columns(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.list(projectId),
      });
    },
  });
}
