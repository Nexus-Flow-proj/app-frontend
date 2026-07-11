import type { InviteStatus } from "@/types";
import type { ProjectRoleDefinition } from "./roles";

export interface SendProjectInviteDto {
  email: string;
  roleId: string;
}

export interface ProjectInviteProject {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface ProjectInviteUser {
  id?: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
}

export interface ProjectInviteDetails {
  id?: string;
  projectId: string;
  email: string;
  projectName: string;
  roleId?: string;
  role?: ProjectRoleDefinition | null;
  roleLabel?: string;
  status?: InviteStatus;
  token?: string;
  expiresAt?: string | null;
  createdAt?: string | null;
  project?: ProjectInviteProject | null;
  invitedBy?: ProjectInviteUser | null;
}

export interface ProjectInviteListItem {
  id: string;
  projectId?: string;
  email: string;
  roleId?: string;
  role?: ProjectRoleDefinition | null;
  roleLabel?: string;
  status: InviteStatus;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  invitedBy?: ProjectInviteUser | null;
}

export interface ProjectInvitesQuery {
  status?: InviteStatus;
  page?: number;
  limit?: number;
}
