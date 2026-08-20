import type { ProjectRoleDefinition } from "./roles";

export interface ProjectMemberSummary {
  id: string;
  projectId: string;
  userId: string;
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
  isOnline?: boolean;
}
