// features/boards/components/AddColumnButton.tsx
// Dev 2 — the "+" column adder that sits at the end of the board.

import { Plus } from "lucide-react";

interface AddColumnButtonProps {
  onClick?: () => void;
}

export function AddColumnButton({ onClick }: AddColumnButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        group flex items-center gap-2.5 w-[260px] shrink-0 h-fit
        px-4 py-3 rounded-2xl border border-dashed border-white/[0.10]
        text-zinc-500 hover:text-zinc-300 hover:border-white/[0.20]
        hover:bg-white/[0.03] transition-all duration-200 text-sm font-medium
      "
    >
      <div className="w-6 h-6 rounded-lg bg-white/[0.06] group-hover:bg-white/[0.10]
                      flex items-center justify-center transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </div>
      Add column
    </button>
  );
}
