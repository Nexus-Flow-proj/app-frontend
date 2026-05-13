import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/models/user";
import { setAccessToken } from "@/lib/axios";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "nf-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
