import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { ChatMessage } from "../types";

export function formatChatTimestamp(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  } catch {
    return isoDate;
  }
}

export function formatChatDateHeader(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "EEEE, MMMM d, yyyy");
  } catch {
    return isoDate;
  }
}

export interface DateGroupedMessages {
  dateHeader: string;
  messages: ChatMessage[];
}

export function groupMessagesByDate(
  messages: ChatMessage[],
): DateGroupedMessages[] {
  const groups: DateGroupedMessages[] = [];
  let currentHeader = "";
  let currentGroup: ChatMessage[] = [];

  for (const message of messages) {
    const header = formatChatDateHeader(message.createdAt);
    if (header !== currentHeader) {
      if (currentGroup.length > 0) {
        groups.push({
          dateHeader: currentHeader,
          messages: currentGroup,
        });
      }
      currentHeader = header;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  }

  if (currentGroup.length > 0) {
    groups.push({
      dateHeader: currentHeader,
      messages: currentGroup,
    });
  }

  return groups;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFileType(fileType: string): boolean {
  return fileType.toLowerCase().startsWith("image/");
}
