import { Layers3, ListPlus, StickyNote } from "lucide-react";
import type { WorkshopObjectKind } from "../types/workshopKinds";

export const ADD_ITEMS: Array<{
  kind: WorkshopObjectKind;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { kind: "Feature", icon: Layers3 },
  { kind: "Task", icon: ListPlus },
  { kind: "Note", icon: StickyNote },
];
