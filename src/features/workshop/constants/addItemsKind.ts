import {
  ClipboardList,
  Diamond,
  GitBranch,
  Milestone,
  Plus,
  StickyNote,
  TriangleAlert,
} from "lucide-react";
import type { WorkshopObjectKind } from "../types/workshopKinds";

export const ADD_ITEMS: Array<{
  kind: WorkshopObjectKind;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  // SectionFrame
  { kind: "Project", icon: ClipboardList },
  { kind: "Phase", icon: GitBranch },
  // StickyNote
  { kind: "Note", icon: StickyNote },
  // TaskCard
  { kind: "Task", icon: Plus },
  { kind: "Milestone", icon: Milestone },
  { kind: "Decision", icon: Diamond },
  { kind: "Risk", icon: TriangleAlert },
];
