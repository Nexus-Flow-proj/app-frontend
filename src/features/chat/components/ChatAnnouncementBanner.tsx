import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AnnouncementBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
    >
      <Megaphone className="size-2.5 shrink-0" />
      <span>ANNOUNCEMENT</span>
    </Badge>
  );
}
