import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function StatChip({
  icon,
  count,
  label,
  color,
}: {
  icon: ReactNode;
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "flex items-center gap-1 text-[11px] font-semibold",
          color,
        )}
      >
        {icon} {count}
      </span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default StatChip;
