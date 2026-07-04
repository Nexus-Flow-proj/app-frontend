import { useWorkshopStore } from "../store/workshopStore";
import type { WorkshopObjectKind } from "../types/workshopKinds";
import { createObject } from "../utils/workshopObjectFactory";

export function useMockWorkshop() {
  const objects = useWorkshopStore((s) => s.objects);
  const connections = useWorkshopStore((s) => s.connections);
  const viewport = useWorkshopStore((s) => s.viewport);
  const selectedObjectId = useWorkshopStore((s) => s.selectedObjectId);
  const addObject = useWorkshopStore((s) => s.addObject);
  const updateObject = useWorkshopStore((s) => s.updateObject);
  const deleteObject = useWorkshopStore((s) => s.deleteObject);
  const setViewport = useWorkshopStore((s) => s.setViewport);

  const addItem = (kind: WorkshopObjectKind, position: Coordinates) => {
    const item = createObject(kind, position);
    addObject(item);
    return item.id;
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
