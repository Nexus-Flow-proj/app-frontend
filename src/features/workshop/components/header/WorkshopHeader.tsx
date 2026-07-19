import { Crosshair, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADD_ITEMS } from "../../constants/addItemsKind";
import { useWorkshopHeader } from "../../hooks/useWorkshopHeader";

interface WorkshopHeaderProps {
  stageSize: {
    width: number;
    height: number;
  };
}

function WorkshopHeader({ stageSize }: WorkshopHeaderProps) {
  const {
    projectId,
    isDirty,
    handleAddItem,
    handleFitView,
    handleResetView,
  } = useWorkshopHeader(stageSize);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
      {/* Canvas Project Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          <h1 className="truncate text-sm font-semibold">Main Workshop</h1>
          {isDirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Local edits
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mock canvas for project {projectId ?? "planning"}.
        </p>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        {ADD_ITEMS.map(({ kind, icon: Icon }) => (
          <Button
            key={kind}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleAddItem(kind)}
          >
            <Icon className="" />
            {kind}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFitView}
          aria-label="Fit workshop view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          aria-label="Reset workshop view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default WorkshopHeader;
