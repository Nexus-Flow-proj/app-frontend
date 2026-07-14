import { Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkshopToolbar } from "../../hooks/useWorkshopToolbar";
import ToolbarButton from "./ToolbarButton";
import { TOOLS } from "../../constants/tools";

export function WorkshopToolbar() {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    canUndo,
    canRedo,
    isEditing,
  } = useWorkshopToolbar();
  const visibleTools = isEditing
    ? TOOLS
    : TOOLS.filter(({ tool }) => tool === "select" || tool === "pan");

  return (
    <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-xl border border-border/80 bg-card/92 px-2 py-1.5 text-[11px] text-muted-foreground shadow-lg shadow-slate-900/5 backdrop-blur-md">
      <div className="flex items-center gap-1">
        {visibleTools.map(({ tool, icon: Icon, label, shortcut }) => (
          <ToolbarButton
            key={tool}
            Icon={Icon}
            label={label}
            shortcut={shortcut}
            active={activeTool === tool}
            onClick={() => setActiveTool(tool)}
          />
        ))}

        {isEditing ? (
          <div className="flex items-center gap-1">
            <Separator orientation="vertical" />

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
              Undo{" "}
              <kbd className="ml-1 rounded bg-muted px-1 text-[10px]">
                Ctrl Z
              </kbd>
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
              Redo{" "}
              <kbd className="ml-1 rounded bg-muted px-1 text-[10px]">
                Ctrl Y
              </kbd>
            </TooltipContent>
          </Tooltip>
          </div>
        ) : null}
      </div>
    </div>
  );
}
