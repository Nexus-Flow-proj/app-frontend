import { create } from "zustand";
import type {
  ProjectDetails,
  ProjectMemberSummary,
  ProjectRoleDefinition,
} from "@/features/project/types";
import {
  hasPermission,
  type RolePermissionPath,
} from "@/features/project/utils/rolePermissions";

interface ProjectState {
  activeProject: ProjectDetails | null;
  members: ProjectMemberSummary[];
  currentUserMember: ProjectMemberSummary | null;
  currentRole: ProjectRoleDefinition | null;

  setActiveProject: (project: ProjectDetails | null) => void;
  setMembers: (members: ProjectMemberSummary[]) => void;
  setCurrentUserMember: (member: ProjectMemberSummary | null) => void;
  setProjectAccess: (project: ProjectDetails | null) => void;

  isAdmin: () => boolean;
  isMember: () => boolean;
  hasPermission: (permissionPath: RolePermissionPath) => boolean;
  hasAnyPermission: (permissionPaths: RolePermissionPath[]) => boolean;
  hasAllPermissions: (permissionPaths: RolePermissionPath[]) => boolean;

  reset: () => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  activeProject: null,
  members: [],
  currentUserMember: null,
  currentRole: null,

  setActiveProject: (project) => set({ activeProject: project }),
  setMembers: (members) => set({ members }),
  setCurrentUserMember: (member) =>
    set({ currentUserMember: member, currentRole: member?.role ?? null }),
  setProjectAccess: (project) =>
    set({
      activeProject: project,
      currentUserMember: project?.currentMember ?? null,
      currentRole: project?.currentMember?.role ?? null,
    }),

  isAdmin: () => get().currentUserMember?.isAdmin === true,
  isMember: () => !!get().currentUserMember,
  hasPermission: (permissionPath) => {
    const role = get().currentRole;
    return role ? hasPermission(role, permissionPath) : false;
  },
  hasAnyPermission: (permissionPaths) =>
    permissionPaths.some((permissionPath) =>
      get().hasPermission(permissionPath),
    ),
  hasAllPermissions: (permissionPaths) =>
    permissionPaths.every((permissionPath) =>
      get().hasPermission(permissionPath),
    ),

  reset: () =>
    set({
      activeProject: null,
      members: [],
      currentUserMember: null,
      currentRole: null,
    }),
}));
