import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: "project-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeProject: state.activeProject,
        members: state.members,
        currentUserMember: state.currentUserMember,
      }),
    },
  ),
);
