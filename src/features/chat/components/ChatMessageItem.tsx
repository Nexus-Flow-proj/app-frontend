import { useState } from "react";
import {
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Reply,
  Trash2,
} from "lucide-react";
import { ChatMessageBubble } from "@/components/shared/chat";
import { ChatMessageType, type ChatMessage } from "../types";
import { formatChatTimestamp } from "../utils";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { useChatStore } from "@/store/chatStore";
import {
  useAddReaction,
  useDeleteMessage,
  useEditMessage,
  usePinMessage,
  useRemoveReaction,
} from "../hooks";
import { ChatReactionBar, QuickReactionTrigger } from "./ChatReactionBar";
import { MessageAttachments } from "./ChatAttachmentPreview";
import { MessageReplyQuote } from "./ChatReplyPreview";
import { AnnouncementBadge } from "./ChatAnnouncementBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessageItemProps {
  message: ChatMessage;
  parentMessage?: ChatMessage | null;
}

export function ChatMessageItem({
  message,
  parentMessage,
}: ChatMessageItemProps) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const projectId = message.projectId;
  const isOwn = message.sender.id === currentUserId;

  const hasPermission = useProjectStore((state) => state.hasPermission);
  const canSend = hasPermission("chat.send");
  const canPin = hasPermission("chat.pin");
  const canDeleteAny = hasPermission("chat.deleteAny");

  const canEdit = isOwn && canSend;
  const canDelete = (isOwn && canSend) || canDeleteAny;

  const setReplyTo = useChatStore((state) => state.setReplyTo);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const editMutation = useEditMessage(projectId);
  const deleteMutation = useDeleteMessage(projectId);
  const pinMutation = usePinMessage(projectId);
  const addReactionMutation = useAddReaction(projectId);
  const removeReactionMutation = useRemoveReaction(projectId);

  function handleSaveEdit() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false);
      return;
    }
    editMutation.mutate(
      { messageId: message.id, dto: { content: trimmed } },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  }

  function handleCancelEdit() {
    setEditContent(message.content);
    setIsEditing(false);
  }

  function handleTogglePin() {
    pinMutation.mutate({
      messageId: message.id,
      dto: { pinned: !message.isPinned },
    });
  }

  function handleDelete() {
    deleteMutation.mutate(message.id);
  }

  function handleAddReaction(emoji: string) {
    addReactionMutation.mutate({
      messageId: message.id,
      dto: { emoji },
    });
  }

  function handleRemoveReaction(emoji: string) {
    removeReactionMutation.mutate({
      messageId: message.id,
      emoji,
    });
  }

  const senderName = `${message.sender.firstName} ${message.sender.lastName}`.trim();
  const isAnnouncement = message.type === ChatMessageType.ANNOUNCEMENT;

  return (
    <ChatMessageBubble
      isOwn={isOwn}
      senderName={senderName}
      senderAvatarUrl={message.sender.avatarUrl}
      timestamp={formatChatTimestamp(message.createdAt)}
      isEdited={message.isEdited}
      headerBadge={
        <div className="flex items-center gap-1">
          {isAnnouncement ? <AnnouncementBadge /> : null}
          {message.isPinned ? (
            <span
              className="flex items-center gap-0.5 text-[10px] text-primary font-medium"
              title={
                message.pinnedBy
                  ? `Pinned by ${message.pinnedBy.firstName} ${message.pinnedBy.lastName}`
                  : "Pinned"
              }
            >
              <Pin className="size-2.5 fill-primary" />
            </span>
          ) : null}
        </div>
      }
      bubbleClassName={
        isAnnouncement
          ? "border border-amber-500/40 bg-amber-500/10 text-foreground dark:text-amber-100"
          : ""
      }
      actions={
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/95 p-0.5 shadow-md backdrop-blur-xs">
          {canSend ? (
            <QuickReactionTrigger onSelectEmoji={handleAddReaction} />
          ) : null}

          {canSend ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-foreground"
              onClick={() => setReplyTo(message)}
              aria-label="Reply to message"
            >
              <Reply className="size-3.5" />
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground"
                aria-label="More message actions"
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "start" : "end"} className="w-36">
              {canSend ? (
                <DropdownMenuItem
                  onClick={() => setReplyTo(message)}
                  className="gap-2 text-xs"
                >
                  <Reply className="size-3.5" /> Reply
                </DropdownMenuItem>
              ) : null}

              {canPin ? (
                <DropdownMenuItem
                  onClick={handleTogglePin}
                  className="gap-2 text-xs"
                >
                  {message.isPinned ? (
                    <>
                      <PinOff className="size-3.5" /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="size-3.5" /> Pin message
                    </>
                  )}
                </DropdownMenuItem>
              ) : null}

              {canEdit ? (
                <DropdownMenuItem
                  onClick={() => {
                    setEditContent(message.content);
                    setIsEditing(true);
                  }}
                  className="gap-2 text-xs"
                >
                  <Pencil className="size-3.5" /> Edit
                </DropdownMenuItem>
              ) : null}

              {canDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      footer={
        <ChatReactionBar
          reactions={message.reactions}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          canSend={canSend}
        />
      }
    >
      {/* Reply quote if replying to another message */}
      {message.parentMessageId ? (
        <MessageReplyQuote
          parentMessage={parentMessage}
          isOwn={isOwn && !isAnnouncement}
        />
      ) : null}

      {/* Editing mode */}
      {isEditing ? (
        <div className="space-y-1.5 py-1">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveEdit();
              } else if (e.key === "Escape") {
                handleCancelEdit();
              }
            }}
            className="h-7 text-xs bg-background text-foreground"
            autoFocus
          />
          <div className="flex items-center justify-end gap-1 text-[10px]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[10px]"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-5 px-2 text-[10px]"
              disabled={editMutation.isPending || !editContent.trim()}
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          {message.content ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : null}
          <MessageAttachments
            attachments={message.attachments}
            isOwn={isOwn && !isAnnouncement}
          />
        </>
      )}
    </ChatMessageBubble>
  );
}
