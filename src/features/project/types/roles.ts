export interface ProjectRoleDefinition {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  level: number;
  permissions: RolePermissions;
  isSystemRole: boolean;
  memberCount?: number;
}

export interface RolePermissions {
  project: {
    read: boolean;
    updateSettings: boolean;
    deleteProject: boolean;
  };
  members: {
    invite: boolean;
    remove: boolean;
    changeRoles: boolean;
  };
  tasks: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    assign: boolean;
  };
  workshop: {
    read: boolean;
    createNodes: boolean;
    updateNodes: boolean;
    deleteNodes: boolean;
    generateWithAi: boolean;
  };
  board: {
    read: boolean;
    moveTasks: boolean;
    manageColumns: boolean;
  };
}

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: RolePermissions;
}

export interface CreateProjectRoleDto {
  name: string;
  description?: string;
  level: number;
  permissions: RolePermissions;
}

export interface UpdateProjectRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissions?: RolePermissions;
}

export type PermissionGroupKey = keyof RolePermissions;
export type PermissionKey<TGroup extends PermissionGroupKey> =
  keyof RolePermissions[TGroup];
