import {
  Diamond,
  Frame,
  Milestone,
  Plus,
  StickyNote,
  TriangleAlert,
  Type,
} from "lucide-react";
import type { WorkshopObjectKind } from "../types/workshopKinds";

export const ADD_ITEMS: Array<{
  kind: WorkshopObjectKind;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  // SectionFrame
  { kind: "Feature", icon: Frame },
  // StickyNote
  { kind: "Note", icon: StickyNote },
  { kind: "Text", icon: Type },
  // TaskCard
  { kind: "Task", icon: Plus },
  { kind: "Milestone", icon: Milestone },
  { kind: "Decision", icon: Diamond },
  { kind: "Risk", icon: TriangleAlert },
];
