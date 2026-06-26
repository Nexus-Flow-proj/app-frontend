import { Badge } from "@/components/ui/badge";
import { dueDateFormate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface DueDateBadgeProps {
  dueDate: string;
}

function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  const { result, dueSoon, overdue } = dueDateFormate(dueDate);

  return (
    <Badge
      variant="ghost"
      size="sm"
      shape="rounded"
      className={cn(
        "h-auto min-w-0 text-[10px] font-medium px-1.5 py-0.5",
        overdue
          ? "bg-destructive/15 text-destructive"
          : dueSoon
            ? "bg-amber-500/15 text-amber-400"
            : "bg-muted text-muted-foreground",
      )}
    >
      <Calendar className="size-3" />
      {result}
    </Badge>
  );
}

export default DueDateBadge;
