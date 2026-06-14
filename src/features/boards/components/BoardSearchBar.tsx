// features/boards/components/BoardSearchBar.tsx
// Dev 4 — search input that filters cards by title. Never touches sort_order arrays.

import { Search, X } from "lucide-react";

interface BoardSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function BoardSearchBar({ value, onChange }: BoardSearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-9 pl-9 pr-8 w-52 rounded-lg bg-white/[0.05] border border-white/[0.09]
          text-sm text-zinc-200 placeholder:text-zinc-600
          focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07]
          transition-all duration-150
        "
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
