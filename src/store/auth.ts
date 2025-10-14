// store/authStore.ts (or where your store lives)
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean | null
  login: () => void
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string, refreshToken: string) => void
  setAuthenticated: (authenticated: boolean | null) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
  	  token: null,      
      refreshToken: null,
      isAuthenticated: null,
      login: () => {
      },
      logout: () => {
        alert("You are logged out")
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
      setToken: (token: string, refreshToken: string) =>
        set({ token, refreshToken }),
      setUser: (user: User) => set({ user }),
      setAuthenticated: (authenticated: boolean | null) =>
        set({ isAuthenticated: authenticated }),
      checkAuth: async () => {
        set({ isAuthenticated: !!get().user })
      },
    }),
    {
      name: "vinicius-fleet-store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !["user", "token", "refreshToken", "isAuthenticated"].includes(key))
        ),
    }
  )
)