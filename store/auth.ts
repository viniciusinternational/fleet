// store/authStore.ts (or where your store lives)
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types"

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean | null
  hasHydrated: boolean
  login: () => void
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string, refreshToken: string) => void
  setAuthenticated: (authenticated: boolean | null) => void
  setHasHydrated: (hydrated: boolean) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,      
      refreshToken: null,
      isAuthenticated: null,
      hasHydrated: false,
      login: () => {
      },
      logout: () => {
        alert("You are logged out")
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          hasHydrated: true,
        })
      },
      setToken: (token: string, refreshToken: string) =>
        set({ token, refreshToken }),
      setUser: (user: User) => set({ user }),
      setAuthenticated: (authenticated: boolean | null) =>
        set({ isAuthenticated: authenticated }),
      setHasHydrated: (hydrated: boolean) =>
        set({ hasHydrated: hydrated }),
      checkAuth: async () => {
        set({ isAuthenticated: !!get().user })
      },
    }),
    {
      name: "vinicius-fleet-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
)
