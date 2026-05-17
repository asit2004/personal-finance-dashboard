import { create } from "zustand";
import { mockUser } from "@/lib/mock-data";
import { UserProfile } from "@/types";

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),

  logout: () => set({ user: null, isAuthenticated: false }),
}));
