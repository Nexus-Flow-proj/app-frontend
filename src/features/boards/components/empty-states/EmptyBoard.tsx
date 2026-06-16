import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function EmptyBoard({ onAddColumn }: { onAddColumn?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-90 gap-4">
      <div className="size-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
        <svg
          className="size-7 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
          />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">No columns yet</p>
        <p className="text-xs text-muted-foreground">
          Add a column to start organizing tasks
        </p>
      </div>
      {onAddColumn && (
        <Button size="sm" onClick={onAddColumn} className="gap-1.5">
          <Plus className="size-3.5" /> Add first column
        </Button>
      )}
    </div>
  );
}

export default EmptyBoard;
