import DueDateBadge from "./DueDateBadge";
import { MessageSquare, Paperclip } from "lucide-react";
import type { BoardMember } from "@/features/boards/types";
import MyAvatar from "@/components/shared/MyAvatar";

interface TaskCardFooterProps {
  dueDate?: string;
  commentCount: number;
  attachmentCount: number;
  assignee: BoardMember | null;
}

function TaskCardFooter({
  dueDate,
  commentCount,
  attachmentCount,
  assignee,
}: TaskCardFooterProps) {
  return (
    <div className="flex items-center justify-between pt-0.5">
      <div className="flex items-center gap-2.5">
        {dueDate && <DueDateBadge dueDate={dueDate} />}
        {commentCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="size-3" />
            {commentCount}
          </span>
        )}
        {attachmentCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Paperclip className="size-3" />
            {attachmentCount}
          </span>
        )}
      </div>
      {assignee && (
        <MyAvatar
          name={assignee.name}
          avatarUrl={assignee.avatarUrl}
          isActive={assignee.isActive}
        />
      )}
    </div>
  );
}

export default TaskCardFooter;
