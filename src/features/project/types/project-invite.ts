import type { InviteStatus, ProjectRole } from "@/types";

export interface SendProjectInviteDto {
  email: string;
  roleLabel: ProjectRole;
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
  roleLabel: ProjectRole;
  status?: InviteStatus;
  token?: string;
  expiresAt?: string | null;
  createdAt?: string | null;
  project?: ProjectInviteProject | null;
  invitedBy?: ProjectInviteUser | null;
}
