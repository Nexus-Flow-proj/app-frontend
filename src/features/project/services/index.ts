import { api } from "@/lib/api/axios";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  CreateProjectDto,
  BulkUpdateProjectMemberRolesDto,
  CreateProjectRoleDto,
  ProjectDetails,
  ProjectInviteDetails,
  ProjectInviteListItem,
  ProjectInvitesQuery,
  ProjectListItem,
  ProjectMemberSummary,
  ProjectRoleDefinition,
  SendProjectInviteDto,
  UpdateProjectMemberRoleDto,
  UpdateProjectRoleDto,
  UpdateProjectDto,
} from "../types";

export const projectService = {
  getProjects: () =>
    api.get<ApiResponse<ProjectListItem[]>>("/projects").then((r) => r.data),

  createProject: (dto: CreateProjectDto) =>
    api.post<ApiResponse<ProjectDetails>>("/projects", dto).then((r) => r.data),

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

  getProjectRoles: (projectId: string) =>
    api
      .get<ApiResponse<ProjectRoleDefinition[]>>(
        `/projects/${projectId}/roles`,
      )
      .then((r) => r.data),

  createProjectRole: (projectId: string, dto: CreateProjectRoleDto) =>
    api
      .post<ApiResponse<ProjectRoleDefinition>>(
        `/projects/${projectId}/roles`,
        dto,
      )
      .then((r) => r.data),

  updateProjectRole: (
    projectId: string,
    roleId: string,
    dto: UpdateProjectRoleDto,
  ) =>
    api
      .patch<ApiResponse<ProjectRoleDefinition>>(
        `/projects/${projectId}/roles/${roleId}`,
        dto,
      )
      .then((r) => r.data),

  deleteProjectRole: (projectId: string, roleId: string) =>
    api
      .delete<ApiResponse<null>>(`/projects/${projectId}/roles/${roleId}`)
      .then((r) => r.data),

  updateProject: (projectId: string, dto: UpdateProjectDto) =>
    api
      .patch<ApiResponse<ProjectDetails>>(`/projects/${projectId}`, dto)
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

  bulkUpdateMemberRoles: (
    projectId: string,
    dto: BulkUpdateProjectMemberRolesDto,
  ) =>
    api
      .patch<ApiResponse<ProjectMemberSummary[]>>(
        `/projects/${projectId}/members/roles`,
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

  getProjectInvites: (projectId: string, query?: ProjectInvitesQuery) =>
    api
      .get<PaginatedResponse<ProjectInviteListItem>>(
        `/projects/${projectId}/invites`,
        {
          params: {
            page: query?.page ?? 1,
            limit: query?.limit ?? 10,
            status: query?.status,
          },
        },
      )
      .then((r) => r.data),

  cancelInvite: (projectId: string, inviteToken: string) =>
    api
      .post<ApiResponse<ProjectInviteDetails>>(
        `/projects/${projectId}/invites/${inviteToken}/cancel`,
      )
      .then((r) => r.data),

  revokeInvite: (projectId: string, inviteToken: string) =>
    api
      .delete<ApiResponse<ProjectInviteDetails | null>>(
        `/projects/${projectId}/invites/${inviteToken}`,
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
