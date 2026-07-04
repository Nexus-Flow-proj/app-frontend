import { NotificationType } from "../enums";
import type { User } from "./user";

export interface Notification {
  id: string;
  userId: string;

  type: NotificationType;

  title: string;
  message: string;

  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };

  metadata: {
    projectId?: string;
    taskId?: string;
    commentId?: string;
    invitationId?: string;
  };

  isRead: boolean;

  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar">;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}

