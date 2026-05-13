import { create } from "zustand";
import type { Project, ProjectMember } from "@/types/models/project";
import { MemberRole } from "@/types/enums";

interface ProjectState {
  activeProject: Project | null;
  members: ProjectMember[];
  currentUserMember: ProjectMember | null;

  setActiveProject: (project: Project | null) => void;
  setMembers: (members: ProjectMember[]) => void;
  setCurrentUserMember: (member: ProjectMember | null) => void;

  isAdmin: () => boolean;
  isMember: () => boolean;

  reset: () => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  activeProject: null,
  members: [],
  currentUserMember: null,

  setActiveProject: (project) => set({ activeProject: project }),
  setMembers: (members) => set({ members }),
  setCurrentUserMember: (member) => set({ currentUserMember: member }),

  isAdmin: () => get().currentUserMember?.role === MemberRole.ADMIN,
  isMember: () => get().currentUserMember?.role === MemberRole.MEMBER,

  reset: () =>
    set({ activeProject: null, members: [], currentUserMember: null }),
}));
