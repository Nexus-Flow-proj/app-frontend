import { CanvasObjectType } from "@/types";
import type {
  CanvasObject,
  SectionFrameData,
  StickyNoteData,
  TaskCardData,
  TextBoxData,
} from "../../types";
import { Frame, SquareDashedMousePointer, StickyNote, Type } from "lucide-react";
import { STATUS_CONFIG } from "../../constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function ObjectListItem({
  obj,
  isSelected,
  onClick,
  onDoubleClick,
}: {
  obj: CanvasObject;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const getTitle = (): string => {
    if (obj.type === CanvasObjectType.TASK_CARD) {
      return (obj.data as TaskCardData).title;
    }
    if (obj.type === CanvasObjectType.SECTION_FRAME) {
      return (obj.data as SectionFrameData).title;
    }
    if (obj.type === CanvasObjectType.TEXT_BOX) {
      return (obj.data as TextBoxData).content?.slice(0, 40) ?? "Text box";
    }
    return (obj.data as StickyNoteData).content?.slice(0, 40) ?? "Sticky note";
  };

  const getIcon = () => {
    if (obj.type === CanvasObjectType.TASK_CARD) {
      return (
        <SquareDashedMousePointer className="h-3.5 w-3.5 shrink-0 text-primary" />
      );
    }
    if (obj.type === CanvasObjectType.STICKY_NOTE) {
      return <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
    }
    if (obj.type === CanvasObjectType.TEXT_BOX) {
      return <Type className="h-3.5 w-3.5 shrink-0 text-sky-500" />;
    }
    return <Frame className="h-3.5 w-3.5 shrink-0 text-blue-500" />;
  };

  const getStatus = () => {
    if (obj.type !== CanvasObjectType.TASK_CARD) return null;
    const data = obj.data as TaskCardData;
    const cfg = STATUS_CONFIG[data.status];

    return cfg ? (
      <span className="ml-auto text-[10px]" style={{ color: cfg.text }}>
        {cfg.label}
      </span>
    ) : null;
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "h-auto w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-accent",
      )}
    >
      {getIcon()}
      <span className="flex-1 truncate">{getTitle()}</span>
      {getStatus()}
    </Button>
  );
}

export default ObjectListItem;
