import { useMemo, useRef, useState } from "react";
import { ExternalLink, File, Paperclip, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import type { TaskAttachment } from "../../types";

interface AttachmentSectionProps {
  attachments: TaskAttachment[];
  isUploading?: boolean;
  isDeleting?: boolean;
  onUploadAttachments: (files: File[]) => void;
  onDeleteAttachment: (attachmentId: string) => void;
}

const MAX_FILES_PER_UPLOAD = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);
const ACCEPTED_FILE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
]);
const ACCEPTED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
].join(",");

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAcceptedAttachment(file: File) {
  const extension = getFileExtension(file.name);

  return (
    ACCEPTED_MIME_TYPES.has(file.type) ||
    ACCEPTED_FILE_EXTENSIONS.has(extension)
  );
}

function validateSelectedFiles(files: File[]) {
  const acceptedFiles: File[] = [];

  for (const file of files) {
    if (acceptedFiles.length >= MAX_FILES_PER_UPLOAD) break;

    if (!isAcceptedAttachment(file)) {
      toast.error(`${file.name} is not a supported attachment type.`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`${file.name} is larger than 10 MB.`);
      continue;
    }

    acceptedFiles.push(file);
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    toast.error(
      `You can upload up to ${MAX_FILES_PER_UPLOAD} files at a time.`,
    );
  }

  return acceptedFiles;
}

function formatFileSize(size: number) {
  if (!size) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function AttachmentSection({
  attachments,
  isUploading,
  isDeleting,
  onUploadAttachments,
  onDeleteAttachment,
}: AttachmentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const selectedFileRows = useMemo(
    () =>
      selectedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: formatFileSize(file.size),
      })),
    [selectedFiles],
  );

  const removeSelectedFile = (fileId: string) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (file) => `${file.name}-${file.size}-${file.lastModified}` !== fileId,
      ),
    );
  };

  const handleUpload = () => {
    if (
      selectedFiles.length === 0 ||
      selectedFiles.length > MAX_FILES_PER_UPLOAD ||
      isUploading
    )
      return;

    const validFiles = validateSelectedFiles(selectedFiles);
    if (validFiles.length !== selectedFiles.length) {
      setSelectedFiles(validFiles);
      return;
    }

    onUploadAttachments(validFiles);
    setSelectedFiles([]);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Paperclip className="size-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Attachments
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {attachments.length}
        </span>
      </div>

      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2"
            >
              <File className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {attachment.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                asChild
                disabled={!attachment.url}
              >
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${attachment.name}`}
                >
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isDeleting}
                onClick={() => onDeleteAttachment(attachment.id)}
                aria-label={`Delete ${attachment.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No attachments yet.</p>
      )}

      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_ATTACHMENT_TYPES}
          disabled={isUploading}
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setSelectedFiles(validateSelectedFiles(files));
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-auto w-full justify-start gap-3 rounded-md border-dashed px-4 py-4 text-left"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Upload className="size-4" />
          </span>
          <span className="min-w-0 flex-1 space-y-0.5">
            <span className="block text-sm font-medium text-foreground">
              Choose files
            </span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} selected`
                : "Images, documents, or zip files"}
            </span>
          </span>
        </Button>
        {selectedFileRows.length > 0 && (
          <div className="space-y-1.5">
            {selectedFileRows.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2"
              >
                <File className="size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {file.size}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 shrink-0"
                  disabled={isUploading}
                  onClick={() => removeSelectedFile(file.id)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground"
              disabled={isUploading}
              onClick={() => setSelectedFiles([])}
            >
              Clear all
            </Button>
          </div>
        )}
        <Button
          type="button"
          size="sm"
          variant="default"
          className="w-full justify-center gap-1.5"
          disabled={
            selectedFiles.length === 0 ||
            selectedFiles.length > MAX_FILES_PER_UPLOAD
          }
          isLoading={isUploading}
          onClick={handleUpload}
        >
          <Upload className="size-3.5" />
          Upload attachments
        </Button>
      </div>
    </section>
  );
}
