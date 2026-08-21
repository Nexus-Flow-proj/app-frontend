export const ChatMessageType = {
  STANDARD: "STANDARD",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  SYSTEM: "SYSTEM",
} as const;

export type ChatMessageType =
  (typeof ChatMessageType)[keyof typeof ChatMessageType];


export interface ChatSender {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface ChatReaction {
  id: string;
  emoji: string;
  user: ChatSender;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  sender: ChatSender;
  content: string;
  type: ChatMessageType;
  isPinned: boolean;
  pinnedBy: ChatSender | null;
  pinnedAt: string | null;
  parentMessageId: string | null;
  isEdited: boolean;
  editedAt: string | null;
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesParams {
  limit?: number;
  cursor?: string;
  search?: string;
  type?: ChatMessageType;
  pinned?: boolean;
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SendMessageAttachmentInput {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
}

export interface SendMessageDto {
  content?: string;
  type?: ChatMessageType;
  parentMessageId?: string;
  attachments?: SendMessageAttachmentInput[];
}

export interface EditMessageDto {
  content: string;
}

export interface PinMessageDto {
  pinned?: boolean;
}

export interface AddReactionDto {
  emoji: string;
}

export interface MarkAsReadDto {
  messageId?: string;
}

export interface MarkAsReadResponse {
  lastReadAt: string;
  lastReadMessageId: string | null;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface UploadAttachmentsResponse {
  attachments: SendMessageAttachmentInput[];
}

export interface TypingUser {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  isTyping: boolean;
}
