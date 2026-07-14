import { useMemo, useState } from "react";
import { CanvasObjectType } from "@/types/enums";
import { useWorkshopStore } from "../store/workshopStore";
import type {
  CanvasObject,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
} from "../types";
import {
  getDraftChange,
  getDraftSummary,
  type DraftChange,
} from "../utils/workshopPlan";

export interface FeatureTreeGroup {
  feature: CanvasObject;
  tasks: CanvasObject[];
  change: DraftChange;
}

function titleOf(object: CanvasObject): string {
  if (object.type === CanvasObjectType.SECTION_FRAME) {
    return (object.data as SectionFrameData).title;
  }
  if (object.type === CanvasObjectType.STICKY_NOTE) {
    return (object.data as StickyNoteData).content;
  }
  return (object.data as TaskCardData).title;
}

export function useWorkshopSidebar() {
  const [search, setSearch] = useState("");
  const objects = useWorkshopStore((state) => state.objects);
  const connections = useWorkshopStore((state) => state.connections);
  const publishedSnapshot = useWorkshopStore(
    (state) => state.publishedSnapshot,
  );
  const isEditing = useWorkshopStore((state) => state.isEditing);
  const selectObject = useWorkshopStore((state) => state.selectObject);
  const selectedObjectId = useWorkshopStore(
    (state) => state.selectedObjectId,
  );

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const features = useMemo(
    () =>
      objects
        .filter((object) => object.type === CanvasObjectType.SECTION_FRAME)
        .sort((a, b) => a.x - b.x || a.y - b.y),
    [objects],
  );
  const tasks = useMemo(
    () =>
      objects.filter((object) => object.type === CanvasObjectType.TASK_CARD),
    [objects],
  );
  const notes = useMemo(
    () =>
      objects.filter(
        (object) =>
          object.type === CanvasObjectType.STICKY_NOTE &&
          (!normalizedSearch ||
            titleOf(object).toLocaleLowerCase().includes(normalizedSearch)),
      ),
    [normalizedSearch, objects],
  );

  const featureGroups = useMemo<FeatureTreeGroup[]>(
    () =>
      features
        .map((feature) => {
          const featureTasks = tasks.filter(
            (task) => (task.data as TaskCardData).featureId === feature.id,
          );
          const featureMatches = titleOf(feature)
            .toLocaleLowerCase()
            .includes(normalizedSearch);
          const visibleTasks = normalizedSearch
            ? featureTasks.filter((task) =>
                titleOf(task).toLocaleLowerCase().includes(normalizedSearch),
              )
            : featureTasks;

          return {
            feature,
            tasks: featureMatches ? featureTasks : visibleTasks,
            change: getDraftChange(feature, publishedSnapshot),
          };
        })
        .filter(
          ({ feature, tasks: visibleTasks }) =>
            !normalizedSearch ||
            titleOf(feature).toLocaleLowerCase().includes(normalizedSearch) ||
            visibleTasks.length > 0,
        ),
    [features, normalizedSearch, publishedSnapshot, tasks],
  );

  return {
    search,
    featureGroups,
    notes,
    selectedObjectId,
    isEditing,
    featureCount: features.length,
    taskCount: tasks.length,
    noteCount: objects.filter(
      (object) => object.type === CanvasObjectType.STICKY_NOTE,
    ).length,
    connectionCount: connections.length,
    draftSummary: getDraftSummary(objects, connections, publishedSnapshot),
    getChange: (object: CanvasObject) =>
      getDraftChange(object, publishedSnapshot),
    setSearch,
    selectObject,
  };
}
