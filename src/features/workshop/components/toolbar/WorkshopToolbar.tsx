// ============================================================
// features/workshop/components/toolbar/WorkshopToolbar.tsx
//
// Vertical icon toolbar on the left edge of the canvas.
// Tool icons: Select · Pan · Task · Sticky · Section · Connect
// Undo / Redo at the bottom.
// Keyboard shortcuts shown in tooltips.
// ============================================================

import {
  MousePointer2,
  Hand,
  SquareDashedMousePointer,
  StickyNote,
  Frame,
  GitBranch,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useWorkshopStore } from "../../store/workshopStore";
import type { WorkshopTool } from "../../types";

interface ToolDef {
  tool: WorkshopTool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const TOOLS: ToolDef[] = [
  {
    tool: "select",
    icon: <MousePointer2 className="h-4 w-4" />,
    label: "Select",
    shortcut: "V",
  },
  {
    tool: "pan",
    icon: <Hand className="h-4 w-4" />,
    label: "Pan",
    shortcut: "H",
  },
  {
    tool: "task",
    icon: <SquareDashedMousePointer className="h-4 w-4" />,
    label: "Add task card",
    shortcut: "T",
  },
  {
    tool: "sticky",
    icon: <StickyNote className="h-4 w-4" />,
    label: "Add sticky note",
    shortcut: "N",
  },
  {
    tool: "section",
    icon: <Frame className="h-4 w-4" />,
    label: "Add section",
    shortcut: "S",
  },
  {
    tool: "connect",
    icon: <GitBranch className="h-4 w-4" />,
    label: "Connect",
    shortcut: "C",
  },
];

export function WorkshopToolbar() {
  const activeTool = useWorkshopStore((s) => s.activeTool);
  const setActiveTool = useWorkshopStore((s) => s.setActiveTool);
  const undo = useWorkshopStore((s) => s.undo);
  const redo = useWorkshopStore((s) => s.redo);
  const undoStack = useWorkshopStore((s) => s.undoStack);
  const redoStack = useWorkshopStore((s) => s.redoStack);

  return (
    <div className="flex h-full w-14 flex-col items-center gap-1 border-r border-border bg-card py-3">
      {/* Tool buttons */}
      {TOOLS.map(({ tool, icon, label, shortcut }) => (
        <ToolButton
          key={tool}
          icon={icon}
          label={label}
          shortcut={shortcut}
          active={activeTool === tool}
          onClick={() => setActiveTool(tool)}
        />
      ))}

      <div className="mt-auto flex flex-col items-center gap-1">
        <Separator className="my-1 w-8" />

        {/* Undo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Undo{" "}
            <kbd className="ml-1 rounded bg-muted px-1 text-[10px]">⌘Z</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Redo{" "}
            <kbd className="ml-1 rounded bg-muted px-1 text-[10px]">⌘Y</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Reusable tool button ─────────────────────────────────────

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  active: boolean;
  onClick: () => void;
}

function ToolButton({
  icon,
  label,
  shortcut,
  active,
  onClick,
}: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            "h-9 w-9 transition-all",
            active
              ? "bg-primary/10 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2 text-xs">
        {label}
        <kbd className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
          {shortcut}
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}
