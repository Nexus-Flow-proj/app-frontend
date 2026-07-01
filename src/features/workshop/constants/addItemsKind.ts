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
  { kind: "Project", icon: ClipboardList },
  { kind: "Phase", icon: GitBranch },
  { kind: "Task", icon: Plus },
  { kind: "Milestone", icon: Milestone },
  { kind: "Note", icon: StickyNote },
  { kind: "Decision", icon: Diamond },
  { kind: "Risk", icon: TriangleAlert },
];
