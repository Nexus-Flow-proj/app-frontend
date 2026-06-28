import { api } from "@/lib/api/axios";
import type { ApiResponse, Project } from "@/types";
import type {
  CreateProjectDto,
  ProjectDetails,
  ProjectInviteDetails,
  ProjectListItem,
  ProjectMemberSummary,
  SendProjectInviteDto,
  UpdateProjectMemberRoleDto,
  UpdateProjectDto,
} from "../types";

export const projectService = {
  getProjects: () =>
    api.get<ApiResponse<ProjectListItem[]>>("/projects").then((r) => r.data),

  createProject: (dto: CreateProjectDto) =>
    api.post<ApiResponse<Project>>("/projects", dto).then((r) => r.data),

  getProject: (projectId: string) =>
    api
      .get<ApiResponse<ProjectDetails>>(`/projects/${projectId}`)
      .then((r) => r.data),

  getProjectMembers: (projectId: string) =>
    api
      .get<ApiResponse<ProjectMemberSummary[]>>(
        `/projects/${projectId}/members`,
      )
      .then((r) => r.data),

  updateProject: (projectId: string, dto: UpdateProjectDto) =>
    api
      .patch<ApiResponse<Project>>(`/projects/${projectId}`, dto)
      .then((r) => r.data),

  updateMemberRole: (
    projectId: string,
    memberId: string,
    dto: UpdateProjectMemberRoleDto,
  ) =>
    api
      .patch<ApiResponse<ProjectMemberSummary>>(
        `/projects/${projectId}/members/${memberId}`,
        dto,
      )
      .then((r) => r.data),

  removeMember: (projectId: string, memberId: string) =>
    api
      .delete<ApiResponse<null>>(`/projects/${projectId}/members/${memberId}`)
      .then((r) => r.data),

  sendInvite: (projectId: string, dto: SendProjectInviteDto) =>
    api
      .post<ApiResponse<ProjectInviteDetails>>(
        `/projects/${projectId}/invites`,
        dto,
      )
      .then((r) => r.data),

  getInvite: (inviteToken: string) =>
    api
      .get<ApiResponse<ProjectInviteDetails>>(
        `/projects/invites/${inviteToken}`,
      )
      .then((r) => r.data),

  acceptInvite: (inviteToken: string) =>
    api
      .post<ApiResponse<ProjectInviteDetails>>(
        `/projects/invites/${inviteToken}/accept`,
      )
      .then((r) => r.data),

  declineInvite: (inviteToken: string) =>
    api
      .post<ApiResponse<ProjectInviteDetails>>(
        `/projects/invites/${inviteToken}/decline`,
      )
      .then((r) => r.data),
};
