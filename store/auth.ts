// store/authStore.ts (or where your store lives)
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types"
import { UserRefreshService } from "@/lib/services/auth-refresh"

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
  startUserRefresh: () => void
  stopUserRefresh: () => void
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
        // Stop user refresh service before logout
        UserRefreshService.stop()
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
      setUser: (user: User) => {
        set({ user })
        // Auto-start refresh service when user is set and authenticated
        const state = get()
        if (user.email && state.isAuthenticated) {
          get().startUserRefresh()
        }
      },
      setAuthenticated: (authenticated: boolean | null) => {
        set({ isAuthenticated: authenticated })
        // Auto-start refresh service if authenticated and user exists
        const state = get()
        if (authenticated && state.user?.email) {
          get().startUserRefresh()
        } else if (!authenticated) {
          // Stop refresh service if not authenticated
          get().stopUserRefresh()
        }
      },
      setHasHydrated: (hydrated: boolean) =>
        set({ hasHydrated: hydrated }),
      checkAuth: async () => {
        const state = get()
        const isAuth = !!state.user
        set({ isAuthenticated: isAuth })
        
        // Auto-start refresh service if authenticated
        if (isAuth && state.user?.email) {
          get().startUserRefresh()
        } else {
          // Stop refresh service if not authenticated
          get().stopUserRefresh()
        }
      },
      startUserRefresh: () => {
        const state = get()
        if (state.user?.email && state.isAuthenticated) {
          UserRefreshService.start(
            (user: User) => {
              // Update user in store with refreshed data
              set({ user })
            },
            state.user.email,
            60000 // 1 minute interval
          )
        }
      },
      stopUserRefresh: () => {
        UserRefreshService.stop()
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
