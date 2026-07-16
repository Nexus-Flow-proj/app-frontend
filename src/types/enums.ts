export const TaskStatus = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskType = {
  FEATURE: "FEATURE",
  BUG: "BUG",
  IMPROVEMENT: "IMPROVEMENT",
  DOCUMENTATION: "DOCUMENTATION",
  RESEARCH: "RESEARCH",
  CHORE: "CHORE",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const InviteStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const ProjectStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  COMPLETED: "COMPLETED",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const CanvasType = {
  MAIN: "PROJECT",
  MINI: "PERSONAL",
} as const;
export type CanvasType = (typeof CanvasType)[keyof typeof CanvasType];

export const CanvasObjectType = {
  TASK_CARD: "TASK_CARD",
  STICKY_NOTE: "STICKY_NOTE",
  IMAGE_BLOCK: "IMAGE_BLOCK",
  SECTION_FRAME: "SECTION_FRAME",
  SUBTASK_CARD: "SUBTASK_CARD",
} as const;
export type CanvasObjectType =
  (typeof CanvasObjectType)[keyof typeof CanvasObjectType];

export const NotificationType = {
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_UNASSIGNED: "TASK_UNASSIGNED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DUE_SOON: "TASK_DUE_SOON",
  TASK_COMPLETED: "TASK_COMPLETED",

  COMMENT_ADDED: "COMMENT_ADDED",
  // COMMENT_REPLY: "COMMENT_REPLY",

  INVITATION_RECEIVED: "INVITATION_RECEIVED",
  INVITATION_ACCEPTED: "INVITATION_ACCEPTED",
  INVITATION_REJECTED: "INVITATION_REJECTED",
  INVITATION_CANCELLED: "INVITATION_CANCELLED",
  INVITE_EXPIRED: "INVITE_EXPIRED",

  REMOVED_FROM_PROJECT: "REMOVED_FROM_PROJECT",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const MemberRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];
