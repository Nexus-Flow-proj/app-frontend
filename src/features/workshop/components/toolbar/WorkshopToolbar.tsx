import { Hand, Redo2, Undo2 } from "lucide-react";
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

interface WorkshopToolbarProps {
  isCompleted: boolean;
}

export function WorkshopToolbar({ isCompleted }: WorkshopToolbarProps) {
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo } =
    useWorkshopToolbar();

  return (
    <div className="absolute bottom-5 left-1/2 z-10 max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-x-auto rounded-xl border border-border bg-card/95 px-2 py-1.5 text-[11px] text-muted-foreground shadow-xl backdrop-blur">
      <div className="flex items-center gap-1">
        {isCompleted ? (
          <ToolbarButton
            Icon={Hand}
            label={"Pan"}
            shortcut={"H"}
            active={activeTool === "pan"}
            onClick={() => setActiveTool("pan")}
          />
        ) : (
          TOOLS.map(({ tool, icon: Icon, label, shortcut }) => (
            <ToolbarButton
              key={tool}
              Icon={Icon}
              label={label}
              shortcut={shortcut}
              active={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          ))
        )}

        {!isCompleted && (
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
        )}
      </div>
    </div>
  );
}
