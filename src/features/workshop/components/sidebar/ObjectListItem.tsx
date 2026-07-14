import { ListTodo, StickyNote } from "lucide-react";
import { CanvasObjectType } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  CanvasObject,
  StickyNoteData,
  TaskCardData,
} from "../../types";
import type { DraftChange } from "../../utils/workshopPlan";

interface ObjectListItemProps {
  obj: CanvasObject;
  isSelected: boolean;
  change: DraftChange;
  onClick: () => void;
}

function ObjectListItem({
  obj,
  isSelected,
  change,
  onClick,
}: ObjectListItemProps) {
  const isNote = obj.type === CanvasObjectType.STICKY_NOTE;
  const label = isNote
    ? (obj.data as StickyNoteData).content
    : (obj.data as TaskCardData).title;
  const Icon = isNote ? StickyNote : ListTodo;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-8 w-full justify-start gap-2 rounded-md pl-8 pr-2 text-xs font-normal",
        isSelected
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {change !== "UNCHANGED" ? (
        <Badge
          variant={change === "ADDED" ? "default" : "secondary"}
          className="h-4 px-1.5 text-[9px]"
        >
          {change === "ADDED" ? "New" : "Edited"}
        </Badge>
      ) : null}
    </Button>
  );
}

export default ObjectListItem;
