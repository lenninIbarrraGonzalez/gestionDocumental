import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { db, type User } from '@/lib/db'
import { verifyPassword } from '@/lib/generators'
import { STORAGE_KEYS } from '@/lib/constants'

interface AuthState {
  user: Omit<User, 'passwordHash'> | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          // Find user by email
          const user = await db.users.where('email').equals(email).first()

          if (!user) {
            set({ isLoading: false, error: 'Credenciales invalidas' })
            return
          }

          // Check if user is active
          if (!user.activo) {
            set({ isLoading: false, error: 'Usuario inactivo' })
            return
          }

          // Verify password
          if (!verifyPassword(password, user.passwordHash)) {
            set({ isLoading: false, error: 'Credenciales invalidas' })
            return
          }

          // Remove passwordHash from user object
          const { passwordHash: _, ...userWithoutPassword } = user
          void _

          // Update last access
          await db.users.update(user.id, { ultimoAcceso: new Date() })

          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error al iniciar sesion',
          })
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
