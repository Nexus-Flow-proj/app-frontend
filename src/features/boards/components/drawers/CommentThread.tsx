// features/boards/components/CommentThread.tsx
// Dev 4 — comment thread inside TaskDetailDrawer.

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Pencil, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";
import type { Comment, BoardMember } from "../../types";

interface CommentThreadProps {
  comments: Comment[];
  currentUser: BoardMember;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  isSubmitting?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

function Avatar({ member }: { member: BoardMember }) {
  const displayName = member.name || "Unknown user";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={displayName}
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
  onUpdateComment,
  onDeleteComment,
  isSubmitting,
  isUpdating,
  isDeleting,
}: CommentThreadProps) {
  const [value, setValue] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const highlightedComments = useHighlightStore(
    state => state.highlighted.get(HighlightEntity.comment),
  );
  const removingComments = useHighlightStore(
    state => state.removing.get(HighlightEntity.comment),
  );

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;
    onAddComment(trimmed);
    setValue("");
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditValue(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditValue("");
  };

  const submitEdit = (commentId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || isUpdating) return;
    onUpdateComment(commentId, trimmed);
    cancelEdit();
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
          {comments.map((comment) => {
            const canManage = comment.authorId === currentUser.id;
            const isEditing = editingCommentId === comment.id;
            const highlighted = highlightedComments?.has(comment.id) ?? false;
            const removing = removingComments?.has(comment.id) ?? false;

            return (
              <div
                key={comment.id}
                className={cn(
                  "flex gap-2.5",
                  highlighted && "animate-comment-add",
                  removing && "animate-comment-remove",
                )}
              >
                <Avatar member={comment.author} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {comment.author.name || "Unknown user"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {canManage && !isEditing && (
                      <div className="ml-auto flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground"
                          onClick={() => startEdit(comment)}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submitEdit(comment.id);
                          }
                        }}
                        rows={2}
                        className="resize-none text-sm"
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={cancelEdit}
                        >
                          <X className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          className="size-7"
                          disabled={!editValue.trim() || isUpdating}
                          onClick={() => submitEdit(comment.id)}
                        >
                          <Check className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/50 border border-border rounded-xl rounded-tl-sm px-3 py-2">
                      {comment.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2.5 pt-1">
        <Avatar member={currentUser} />
        <div className="flex-1 flex items-end gap-2">
          <Textarea
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
          />
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
