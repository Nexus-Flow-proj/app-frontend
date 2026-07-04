import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
  active: boolean;
  onClick: () => void;
}

function ToolbarButton({
  Icon,
  label,
  shortcut,
  active,
  onClick,
}: ToolbarButtonProps) {
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
          <Icon className="h-4 w-4" />
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

export default ToolbarButton;
