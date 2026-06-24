import { api } from "@/lib/api/axios";
import type { ApiResponse, Project } from "@/types";
import type { CreateProjectDto, UpdateProjectDto } from "../types";

export const projectService = {
  createProject: (dto: CreateProjectDto) =>
    api.post<ApiResponse<Project>>("/projects", dto).then((r) => r.data),

  getProject: (projectId: string) =>
    api
      .get<ApiResponse<Project>>(`/projects/${projectId}`)
      .then((r) => r.data),

  updateProject: (projectId: string, dto: UpdateProjectDto) =>
    api
      .patch<ApiResponse<Project>>(`/projects/${projectId}`, dto)
      .then((r) => r.data),
};
