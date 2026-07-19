import type { ProjectStatus } from "@/types";

export interface ProjectListItem {
  id: string;
  name: string;
  description?: string | null;
  deadline?: string | null;
  status: ProjectStatus;
  adminId?: string;
  memberCount: number;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDetails extends ProjectListItem {
  taskCount?: number;
  completedTaskCount?: number;
}
