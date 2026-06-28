import { api } from "@/lib/api/axios";
import type { ApiResponse, Project } from "@/types";
import type {
  CreateProjectDto,
  ProjectDetails,
  ProjectMemberSummary,
  UpdateProjectDto,
} from "../types";

export const projectService = {
  getProjects: () =>
    api.get<ApiResponse<Project[]>>("/projects").then((r) => r.data),

  createProject: (dto: CreateProjectDto) =>
    api.post<ApiResponse<Project>>("/projects", dto).then((r) => r.data),

  getProject: (projectId: string) =>
    api
      .get<ApiResponse<ProjectDetails>>(`/projects/${projectId}`)
      .then((r) => r.data),

  getProjectMembers: (projectId: string) =>
    api
      .get<
        ApiResponse<ProjectMemberSummary[]>
      >(`/projects/${projectId}/members`)
      .then((r) => r.data),

  updateProject: (projectId: string, dto: UpdateProjectDto) =>
    api
      .patch<ApiResponse<Project>>(`/projects/${projectId}`, dto)
      .then((r) => r.data),
};
