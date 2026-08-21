import { useRef, useState } from "react";
import {
  LoaderCircle,
  Megaphone,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { ChatComposer } from "@/components/shared/chat";
import { useProjectStore } from "@/store/projectStore";
import { useChatStore } from "@/store/chatStore";
import { useSendMessage, useUploadAttachments, useChatSocket } from "../hooks";
import {
  DISALLOWED_EXTENSIONS,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
} from "../constants";
import {
  ChatMessageType,
  type SendMessageAttachmentInput,
} from "../types";
import { ComposerAttachments } from "./ChatAttachmentPreview";
import { ComposerReplyBanner } from "./ChatReplyPreview";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatComposerBarProps {
  projectId: string;
}

export function ChatComposerBar({ projectId }: ChatComposerBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPermission = useProjectStore((state) => state.hasPermission);
  const canSend = hasPermission("chat.send");
  const canSendAnnouncement = hasPermission("chat.sendAnnouncement");

  const replyTo = useChatStore((state) => state.replyTo);
  const setReplyTo = useChatStore((state) => state.setReplyTo);
  const { handleUserKeystroke, handleBlur } = useChatSocket(projectId);

  const [content, setContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [attachments, setAttachments] = useState<SendMessageAttachmentInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const sendMutation = useSendMessage(projectId);
  const uploadMutation = useUploadAttachments(projectId);

  if (!canSend) {
    return (
      <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t">
        You have view-only access to this project chat.
      </div>
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Validation: total count
    if (attachments.length + files.length > MAX_ATTACHMENT_COUNT) {
      toast.error(
        `You can upload up to ${MAX_ATTACHMENT_COUNT} attachments per message.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validation: file sizes & extensions
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        toast.error(`File "${file.name}" exceeds the 10 MB limit.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (DISALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File extension "${ext}" is not allowed.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    setIsUploading(true);
    uploadMutation.mutate(files, {
      onSuccess: (res) => {
        setAttachments((prev) => [...prev, ...res.data.attachments]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: () => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  }

  function handleRemoveAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleTextChange(value: string) {
    setContent(value);
    handleUserKeystroke();
  }

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;

    sendMutation.mutate(
      {
        content: trimmed || undefined,
        type: isAnnouncement
          ? ChatMessageType.ANNOUNCEMENT
          : ChatMessageType.STANDARD,
        parentMessageId: replyTo?.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: () => {
          setContent("");
          setAttachments([]);
          setIsAnnouncement(false);
          setReplyTo(null);
          handleBlur();
        },
      },
    );
  }

  return (
    <div>
      {/* Hidden file picker button-triggered */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="*/*"
      />

      <ChatComposer
        value={content}
        onChange={handleTextChange}
        onSubmit={handleSubmit}
        disabled={sendMutation.isPending || isUploading}
        isSubmitting={sendMutation.isPending}
        placeholder={
          isAnnouncement
            ? "Write an announcement to the whole project…"
            : "Type a message…"
        }
        topBanner={
          <div className="space-y-1.5">
            <ComposerReplyBanner
              replyTo={replyTo}
              onCancel={() => setReplyTo(null)}
            />
            <ComposerAttachments
              attachments={attachments}
              onRemove={handleRemoveAttachment}
            />
          </div>
        }
        actionsLeft={
          <div className="flex items-center gap-1">
            {/* Attachments button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                  disabled={
                    isUploading ||
                    attachments.length >= MAX_ATTACHMENT_COUNT ||
                    sendMutation.isPending
                  }
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload attachments"
                >
                  {isUploading ? (
                    <LoaderCircle className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <Paperclip className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Upload files (max 5, up to 10MB each)
              </TooltipContent>
            </Tooltip>

            {/* Announcement toggle */}
            {canSendAnnouncement ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isAnnouncement ? "secondary" : "ghost"}
                    size="icon"
                    className={`size-7 rounded-lg transition-colors ${
                      isAnnouncement
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setIsAnnouncement(!isAnnouncement)}
                    aria-label="Toggle announcement mode"
                  >
                    <Megaphone className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isAnnouncement
                    ? "Announcement mode active (click to disable)"
                    : "Post as announcement"}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
