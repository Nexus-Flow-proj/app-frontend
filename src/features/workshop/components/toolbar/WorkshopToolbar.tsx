import type { ReactNode } from "react";
import {
  Frame,
  GitBranch,
  Hand,
  MousePointer2,
  Redo2,
  SquareDashedMousePointer,
  StickyNote,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useWorkshopToolbar } from "../../hooks/useWorkshopToolbar";
import type { WorkshopTool } from "../../types";

interface ToolDef {
  tool: WorkshopTool;
  icon: ReactNode;
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
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo } =
    useWorkshopToolbar();

  return (
    <div className="flex h-full w-14 flex-col items-center gap-1 border-r border-border bg-card py-3">
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Undo <kbd className="ml-1 rounded bg-muted px-1 text-[10px]">Ctrl Z</kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Redo <kbd className="ml-1 rounded bg-muted px-1 text-[10px]">Ctrl Y</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

interface ToolButtonProps {
  icon: ReactNode;
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
