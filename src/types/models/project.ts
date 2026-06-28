import { InviteStatus, MemberRole, ProjectStatus } from "../enums";
import type { User } from "./user";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  ownerId: string;
  owner: User;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  role: MemberRole;
  joinedAt: string;
}

export interface Invite {
  id: string;
  projectId: string;
  project: Pick<Project, "id" | "name" | "color">;
  email: string;
  role: MemberRole;
  status: InviteStatus;
  token: string;
  expiresAt: string;
  invitedBy: User;
  createdAt: string;
}
