import { Badge } from "@/components/ui/badge";
// import { PRIORITY_CONFIG } from "../../../constants";
// import { cn } from "@/lib/utils";
import type { Priority } from "@/features/boards/types";
// import { TaskPriority } from "@/features/boards/types/enums";

interface TaskCardTagsProps {
  priority: Priority;
  tags: string[];
}

function TaskCardTags({ tags }: TaskCardTagsProps) {
  // const priorityStyle =
  //   PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[TaskPriority.MEDIUM];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* <Badge
        variant="outline"
        className={cn(
          "font-semibold uppercase tracking-wide gap-1 h-5",
          priorityStyle.bgClass,
          priorityStyle.borderClass,
          priorityStyle.textClass,
        )}
      > */}
      {/* <span className={cn("size-1.5 rounded-full", priorityStyle.dotClass)} /> */}
      {/* {priorityStyle.label} */}
      {/* </Badge> */}
      {tags.slice(0, 2).map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export default TaskCardTags;
