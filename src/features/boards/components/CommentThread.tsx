// features/boards/components/CommentThread.tsx
// Dev 4 — comment thread inside TaskDetailDrawer.

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import type { Comment, BoardMember } from "../types";

interface CommentThreadProps {
  comments: Comment[];
  currentUser: BoardMember;
  onAddComment: (content: string) => void;
  isSubmitting?: boolean;
}

function Avatar({ member }: { member: BoardMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className="size-7 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="size-7 rounded-full bg-primary/15 ring-1 ring-primary/25 shrink-0 flex items-center justify-center text-[11px] font-semibold text-primary">
      {initials}
    </div>
  );
}

export function CommentThread({
  comments,
  currentUser,
  onAddComment,
  isSubmitting,
}: CommentThreadProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;
    onAddComment(trimmed);
    setValue("");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Comments
        {comments.length > 0 && (
          <span className="ml-1.5 font-normal normal-case">
            {comments.length}
          </span>
        )}
      </p>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar member={comment.author} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    {comment.author.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed bg-muted/50 border border-border rounded-xl rounded-tl-sm px-3 py-2">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2.5 pt-1">
        <Avatar member={currentUser} />
        <div className="flex-1 flex items-end gap-2">
          {/* <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Write a comment… (Enter to send)"
            rows={2}
            className="flex-1 resize-none text-sm"
          /> */}
          <Button
            size="icon"
            className="size-8 shrink-0"
            disabled={!value.trim() || isSubmitting}
            onClick={submit}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
