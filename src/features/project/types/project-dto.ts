export interface CreateProjectDto {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectMemberRoleDto {
  roleId: string;
}

export interface BulkUpdateProjectMemberRolesDto {
  assignments: {
    memberId: string;
    roleId: string;
  }[];
}
