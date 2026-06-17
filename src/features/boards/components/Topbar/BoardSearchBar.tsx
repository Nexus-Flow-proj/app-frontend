// features/boards/components/BoardSearchBar.tsx
// Dev 4 — search input bound to URL param. Uses shadcn Input.

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoardSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function BoardSearchBar({
  value,
  onChange,
  className,
}: BoardSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks…"
        className="h-8 pl-8 pr-7 w-44 text-xs focus-visible:w-52 transition-all duration-200 bg-muted/50"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 size-5 rounded-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}
