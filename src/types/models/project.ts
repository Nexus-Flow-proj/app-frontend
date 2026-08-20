import type { ProjectRoleDefinition } from "@/features/project/types";
import { InviteStatus, ProjectStatus } from "../enums";
import type { User } from "./user";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  color?: string | null;
  adminId?: string;
  ownerId?: string;
  owner?: User;
  memberCount: number;
  taskCount?: number;
  completedTaskCount?: number;
  currentMember?: ProjectMember | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  email: string;
  firstName: string;
  lastName: string;
  title: string | null;
  avatarUrl: string | null;
  roleId: string;
  role?: ProjectRoleDefinition | null;
  roleLabel?: string;
  isAdmin?: boolean;
  lastVisitedAt?: string | null;
  joinedAt: string;
}

export interface Invite {
  id: string;
  projectId: string;
  project: Pick<Project, "id" | "name" | "color">;
  email: string;
  roleId?: string;
  role?: ProjectRoleDefinition | null;
  roleLabel?: string;
  status: InviteStatus;
  token: string;
  expiresAt: string;
  invitedBy: User;
  createdAt: string;
}
