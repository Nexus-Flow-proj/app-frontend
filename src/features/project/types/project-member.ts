import type { ProjectRole } from "@/types";

export interface ProjectMemberSummary {
  id: string;
  projectId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string | null;
  avatarUrl: string | null;
  roleLabel: ProjectRole;
  isAdmin?: boolean;
  joinedAt: string;
}
