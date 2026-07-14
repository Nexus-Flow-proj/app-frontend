import { CanvasObjectType } from "@/types/enums";
import { useWorkshopStore } from "../store/workshopStore";
import type { WorkshopObjectKind } from "../types/workshopKinds";
import type { CanvasObject } from "../types";
import {
  getContainingFeature,
  getNextTaskPosition,
} from "../utils/featureContainment";
import { createObject } from "../utils/workshopObjectFactory";

export function useWorkshopCanvas() {
  const objects = useWorkshopStore((state) => state.objects);
  const connections = useWorkshopStore((state) => state.connections);
  const viewport = useWorkshopStore((state) => state.viewport);
  const selectedObjectId = useWorkshopStore(
    (state) => state.selectedObjectId,
  );
  const addObject = useWorkshopStore((state) => state.addObject);
  const updateObject = useWorkshopStore((state) => state.updateObject);
  const deleteObject = useWorkshopStore((state) => state.deleteObject);
  const setViewport = useWorkshopStore((state) => state.setViewport);

  const addItem = (
    kind: WorkshopObjectKind,
    position: Coordinates,
  ): CanvasObject | null => {
    const selectedFeature = objects.find(
      (object) =>
        object.id === selectedObjectId &&
        object.type === CanvasObjectType.SECTION_FRAME,
    );
    const containingFeature = getContainingFeature(objects, position);
    const feature = selectedFeature ?? containingFeature;

    if (kind === "Task" && !feature) return null;

    let item = createObject(kind, position, feature?.id);
    if (kind === "Task" && feature) {
      item = {
        ...item,
        ...getNextTaskPosition(item, feature, objects, position),
      };
    }

    addObject(item);
    return item;
  };

  return {
    objects,
    connections,
    viewport,
    selectedObjectId,
    addItem,
    updateObject,
    deleteObject,
    setViewport,
  };
}
