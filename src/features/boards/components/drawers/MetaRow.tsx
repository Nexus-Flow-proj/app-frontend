import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface MetaRowProps {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}

export function MetaRow({ icon: Icon, label, children }: MetaRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-24 shrink-0 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
