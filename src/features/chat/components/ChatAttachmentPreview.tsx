import { FileText, Image as ImageIcon, X } from "lucide-react";
import { formatFileSize, isImageFileType } from "../utils";
import type { ChatAttachment, SendMessageAttachmentInput } from "../types";
import { Button } from "@/components/ui/button";

interface MessageAttachmentsProps {
  attachments: ChatAttachment[];
  isOwn?: boolean;
}

export function MessageAttachments({
  attachments,
  isOwn = false,
}: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-1.5 w-full">
      {attachments.map((att) => {
        const isImg = isImageFileType(att.fileType);

        if (isImg) {
          return (
            <a
              key={att.id}
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-border/40 transition-opacity hover:opacity-90 max-w-[260px]"
            >
              <img
                src={att.fileUrl}
                alt={att.fileName}
                className="max-h-48 w-full object-cover"
                loading="lazy"
              />
            </a>
          );
        }

        return (
          <a
            key={att.id}
            href={att.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={att.fileName}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors max-w-[260px] ${
              isOwn
                ? "border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
                : "border-border/60 bg-background/60 hover:bg-background text-foreground"
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded bg-background/50 text-foreground">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{att.fileName}</p>
              <p className="text-[10px] opacity-70">
                {formatFileSize(att.fileSize)}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}

interface ComposerAttachmentsProps {
  attachments: SendMessageAttachmentInput[];
  onRemove: (index: number) => void;
}

export function ComposerAttachments({
  attachments,
  onRemove,
}: ComposerAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border-b border-border/40 bg-muted/20">
      {attachments.map((att, index) => {
        const isImg = isImageFileType(att.fileType);

        return (
          <div
            key={`${att.storagePath}-${index}`}
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2 py-1 text-xs shadow-xs"
          >
            {isImg ? (
              <ImageIcon className="size-3.5 text-primary shrink-0" />
            ) : (
              <FileText className="size-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="max-w-[120px] truncate text-[11px] font-medium">
              {att.fileName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({formatFileSize(att.fileSize)})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-4 ml-1 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${att.fileName}`}
            >
              <X className="size-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
