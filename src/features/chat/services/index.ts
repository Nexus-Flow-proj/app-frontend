import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  AddReactionDto,
  ChatMessage,
  EditMessageDto,
  GetMessagesParams,
  GetMessagesResponse,
  MarkAsReadDto,
  MarkAsReadResponse,
  PinMessageDto,
  SendMessageDto,
  UnreadCountResponse,
  UploadAttachmentsResponse,
} from "../types";

export const chatService = {
  getMessages: (projectId: string, params?: GetMessagesParams) =>
    api
      .get<ApiResponse<GetMessagesResponse>>(
        `/projects/${projectId}/chat/messages`,
        { params },
      )
      .then((r) => r.data),

  sendMessage: (projectId: string, dto: SendMessageDto) =>
    api
      .post<ApiResponse<ChatMessage>>(
        `/projects/${projectId}/chat/messages`,
        dto,
      )
      .then((r) => r.data),

  getPinnedMessages: (projectId: string) =>
    api
      .get<ApiResponse<ChatMessage[]>>(
        `/projects/${projectId}/chat/messages/pinned`,
      )
      .then((r) => r.data),

  getUnreadCount: (projectId: string) =>
    api
      .get<ApiResponse<UnreadCountResponse>>(
        `/projects/${projectId}/chat/messages/unread-count`,
      )
      .then((r) => r.data),

  markAsRead: (projectId: string, dto?: MarkAsReadDto) =>
    api
      .post<ApiResponse<MarkAsReadResponse>>(
        `/projects/${projectId}/chat/messages/read`,
        dto ?? {},
      )
      .then((r) => r.data),

  uploadAttachments: (projectId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return api
      .post<ApiResponse<UploadAttachmentsResponse>>(
        `/projects/${projectId}/chat/messages/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
      .then((r) => r.data);
  },

  getMessage: (projectId: string, messageId: string) =>
    api
      .get<ApiResponse<ChatMessage>>(
        `/projects/${projectId}/chat/messages/${messageId}`,
      )
      .then((r) => r.data),

  editMessage: (
    projectId: string,
    messageId: string,
    dto: EditMessageDto,
  ) =>
    api
      .patch<ApiResponse<ChatMessage>>(
        `/projects/${projectId}/chat/messages/${messageId}`,
        dto,
      )
      .then((r) => r.data),

  deleteMessage: (projectId: string, messageId: string) =>
    api
      .delete<ApiResponse<null>>(
        `/projects/${projectId}/chat/messages/${messageId}`,
      )
      .then((r) => r.data),

  pinMessage: (
    projectId: string,
    messageId: string,
    dto?: PinMessageDto,
  ) =>
    api
      .post<ApiResponse<ChatMessage>>(
        `/projects/${projectId}/chat/messages/${messageId}/pin`,
        dto ?? {},
      )
      .then((r) => r.data),

  addReaction: (
    projectId: string,
    messageId: string,
    dto: AddReactionDto,
  ) =>
    api
      .post<ApiResponse<null>>(
        `/projects/${projectId}/chat/messages/${messageId}/reactions`,
        dto,
      )
      .then((r) => r.data),

  removeReaction: (
    projectId: string,
    messageId: string,
    emoji: string,
  ) =>
    api
      .delete<ApiResponse<null>>(
        `/projects/${projectId}/chat/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
      )
      .then((r) => r.data),
};
