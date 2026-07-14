import { useEffect } from "react";
import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { workshopService } from "../services";
import { useWorkshopStore } from "../store/workshopStore";

export function useWorkshopCanvasSource(projectId: string) {
  const loadCanvas = useWorkshopStore((state) => state.loadCanvas);
  const query = useApiQuery(
    QUERY_KEYS.canvas.main(projectId),
    () => workshopService.getCanvas(projectId),
    {
      enabled: Boolean(projectId),
      staleTime: 1000 * 60 * 2,
    },
  );

  useEffect(() => {
    if (!query.data) return;
    loadCanvas(
      projectId,
      query.data.id,
      query.data.objects ?? [],
      query.data.connections ?? [],
      query.data.viewport,
    );
  }, [loadCanvas, projectId, query.data]);

  return query;
}
