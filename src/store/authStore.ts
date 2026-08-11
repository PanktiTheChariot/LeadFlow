import { create } from "zustand";
import type { SessionUser } from "@/types";

interface AuthState {
  user: SessionUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setUser: (user: SessionUser | null) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) => set({ user, status: user ? "authenticated" : "unauthenticated" }),
  hydrate: async () => {
    set({ status: "loading" });
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        set({ user: null, status: "unauthenticated" });
        return;
      }
      const body = await response.json();
      set({ user: body.data.user, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
