import { useMemo, useState } from "react";
import { CanvasObjectType } from "@/types/enums";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
} from "../types";

export function useWorkshopSidebar() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const objects = useWorkshopStore((s) => s.objects);
  const selectObject = useWorkshopStore((s) => s.selectObject);
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);

  const filtered = useMemo(
    () =>
      objects.filter((obj) => {
        if (typeFilter !== "ALL" && obj.type !== typeFilter) return false;

        if (
          statusFilter !== "ALL" &&
          obj.type === CanvasObjectType.TASK_CARD
        ) {
          const data = obj.data as TaskCardData;
          if (data.status !== statusFilter) return false;
        }

        if (search) {
          const normalizedSearch = search.toLowerCase();
          const title =
            obj.type === CanvasObjectType.TASK_CARD
              ? (obj.data as TaskCardData).title
              : obj.type === CanvasObjectType.SECTION_FRAME
                ? (obj.data as SectionFrameData).title
                : ((obj.data as StickyNoteData).content ?? "");

          if (!title.toLowerCase().includes(normalizedSearch)) return false;
        }

        return true;
      }),
    [objects, search, statusFilter, typeFilter],
  );

  const stats = useMemo(
    () => ({
      taskCount: objects.filter(
        (obj) => obj.type === CanvasObjectType.TASK_CARD,
      ).length,
      stickyCount: objects.filter(
        (obj) => obj.type === CanvasObjectType.STICKY_NOTE,
      ).length,
      frameCount: objects.filter(
        (obj) => obj.type === CanvasObjectType.SECTION_FRAME,
      ).length,
    }),
    [objects],
  );

  return {
    search,
    typeFilter,
    statusFilter,
    filtered,
    selectedObjectId,
    ...stats,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    selectObject,
  };
}
