import type { ProjectStatus } from "@/types";
import type { ProjectMemberSummary } from "./project-member";

export interface ProjectListItem {
  id: string;
  name: string;
  description?: string | null;
  deadline?: string | null;
  status: ProjectStatus;
  adminId?: string;
  memberCount: number;
  color?: string | null;
  currentMember?: ProjectMemberSummary | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDetails extends ProjectListItem {
  taskCount?: number;
  completedTaskCount?: number;
}

export interface ProjectSummary {
  statusSummary: string;
  whoIsDoingWhat: string;
  remainingTasksSummary: string;
  bottlenecks: string[];
  workloadWarnings: string[];
  highlights?: string[];
  nextSteps?: string[];
}
