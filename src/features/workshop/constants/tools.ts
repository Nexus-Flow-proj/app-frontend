import type { WorkshopTool } from "../types";
import {
  Frame,
  GitBranch,
  Hand,
  MousePointer2,
  SquareDashedMousePointer,
  StickyNote,
} from "lucide-react";

interface ToolDef {
  tool: WorkshopTool;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
}

export const TOOLS: ToolDef[] = [
  {
    tool: "select",
    icon: MousePointer2,
    label: "Select",
    shortcut: "V",
  },
  {
    tool: "pan",
    icon: Hand,
    label: "Pan",
    shortcut: "H",
  },
  {
    tool: "task",
    icon: SquareDashedMousePointer,
    label: "Add task card",
    shortcut: "T",
  },
  {
    tool: "sticky",
    icon: StickyNote,
    label: "Add sticky note",
    shortcut: "N",
  },
  {
    tool: "section",
    icon: Frame,
    label: "Add section",
    shortcut: "S",
  },
  {
    tool: "connect",
    icon: GitBranch,
    label: "Connect",
    shortcut: "C",
  },
];
