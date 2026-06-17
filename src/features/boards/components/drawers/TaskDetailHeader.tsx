import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { BoardColumn, TaskDetail } from "../../types";

interface TaskDetailHeaderProps {
  task: TaskDetail;
  columns: BoardColumn[];
}

export function TaskDetailHeader({ task, columns }: TaskDetailHeaderProps) {
  const columnTitle =
    columns.find((column) => column.id === task.boardColumnId)?.name ?? "Board";

  return (
    <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
      <p className="text-xs text-muted-foreground mb-1">{columnTitle}</p>
      <SheetTitle className="text-base font-semibold text-left leading-snug">
        {task.title}
      </SheetTitle>
      {/* {task.description && (
        <p className="text-sm text-muted-foreground leading-relaxed text-left mt-1">
          {task.description}
          lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas,
          eaque Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cum,
          natus? Ab provident ut fuga qui placeat rem? Ipsa enim assumenda odio
          impedit eaque consequuntur rerum? Quas distinctio repellendus dicta
          iure.
        </p>
      )} */}
    </SheetHeader>
  );
}
