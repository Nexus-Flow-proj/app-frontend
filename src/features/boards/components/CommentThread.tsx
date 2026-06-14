// features/boards/components/CommentThread.tsx
// Dev 4 — comment thread inside TaskDetailDrawer.

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import type { Comment, BoardMember } from "../types/types.index (1)";

interface CommentThreadProps {
  comments: Comment[];
  currentUser: BoardMember;
  onAddComment: (content: string) => void;
  isSubmitting?: boolean;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ member }: { member: BoardMember }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className="w-7 h-7 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-7 h-7 rounded-full bg-indigo-500/30 ring-1 ring-indigo-400/30 shrink-0
                    flex items-center justify-center text-[11px] font-semibold text-indigo-300"
    >
      {initials}
    </div>
  );
}

// ─── Single comment ───────────────────────────────────────────────────────────
function CommentBubble({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-2.5">
      <Avatar member={comment.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-zinc-300">
            {comment.author.name}
          </span>
          <span className="text-[11px] text-zinc-600">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div
          className="text-sm text-zinc-400 leading-relaxed bg-white/[0.03] border border-white/[0.06]
                        rounded-xl rounded-tl-sm px-3 py-2"
        >
          {comment.content}
        </div>
      </div>
    </div>
  );
}

// ─── Comment input ────────────────────────────────────────────────────────────
function CommentInput({
  currentUser,
  onSubmit,
  isSubmitting,
}: {
  currentUser: BoardMember;
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className="flex gap-2.5 pt-1">
      <Avatar member={currentUser} />
      <div className="flex-1 flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Write a comment... (Enter to send)"
          rows={2}
          className="flex-1 resize-none px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09]
                     text-sm text-zinc-200 placeholder:text-zinc-600
                     focus:outline-none focus:border-indigo-500/40
                     transition-colors"
        />
        <button
          onClick={submit}
          disabled={!value.trim() || isSubmitting}
          className="h-8 w-8 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30
                     disabled:cursor-not-allowed flex items-center justify-center
                     transition-all duration-150 shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CommentThread({
  comments,
  currentUser,
  onAddComment,
  isSubmitting,
}: CommentThreadProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Comments
        {comments.length > 0 && (
          <span className="ml-2 text-zinc-600 normal-case font-normal">
            {comments.length}
          </span>
        )}
      </h4>

      {comments.length === 0 ? (
        <p className="text-sm text-zinc-600 italic">
          No comments yet. Be the first.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentBubble key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      <CommentInput
        currentUser={currentUser}
        onSubmit={onAddComment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
