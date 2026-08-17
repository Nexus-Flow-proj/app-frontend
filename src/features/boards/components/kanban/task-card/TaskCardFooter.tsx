import DueDateBadge from "./DueDateBadge";
import { MessageSquare, Paperclip } from "lucide-react";
import type { BoardMember } from "@/features/boards/types";
import MyAvatar from "@/components/shared/MyAvatar";

interface TaskCardFooterProps {
  dueDate?: string;
  commentsCount: number;
  attachmentsCount: number;
  assignee: BoardMember | null;
}

function TaskCardFooter({
  dueDate,
  commentsCount,
  attachmentsCount,
  assignee,
}: TaskCardFooterProps) {
  return (
    <div className="flex items-center justify-between pt-0.5">
      <div className="flex items-center gap-2.5">
        {dueDate && <DueDateBadge dueDate={dueDate} />}
        {commentsCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="size-3" />
            {commentsCount}
          </span>
        )}
        {attachmentsCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Paperclip className="size-3" />
            {attachmentsCount}
          </span>
        )}
      </div>
      {assignee && (
        <MyAvatar
          name={assignee.name}
          avatarUrl={assignee.avatarUrl}
          isActive={assignee.isActive}
          userId={assignee.id}
        />
      )}
    </div>
  );
}

export default TaskCardFooter;
