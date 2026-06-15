// features/boards/components/AddColumnButton.tsx
// Dev 2 — standalone add-column button (used separately if needed).

import { Plus } from "lucide-react";

interface AddColumnButtonProps {
  onClick?: () => void;
}

export function AddColumnButton({ onClick }: AddColumnButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 w-[248px] shrink-0 h-fit px-4 py-2.5
                 rounded-2xl border border-dashed border-border text-muted-foreground
                 hover:text-foreground hover:border-border/80 hover:bg-muted/50
                 transition-all duration-200 text-sm font-medium"
    >
      <div className="size-5 rounded-md bg-muted group-hover:bg-secondary flex items-center justify-center transition-colors">
        <Plus className="size-3" />
      </div>
      Add column
    </button>
  );
}
