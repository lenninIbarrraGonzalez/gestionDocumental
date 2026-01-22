import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { db, type User } from '@/lib/db'
import { verifyPassword } from '@/lib/generators'
import { STORAGE_KEYS, SECURITY_CONFIG } from '@/lib/constants'

interface LoginAttempts {
  count: number
  lockedUntil: number | null
}

interface AuthState {
  user: Omit<User, 'passwordHash'> | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastActivity: number | null

  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  updateActivity: () => void
  checkSessionTimeout: () => boolean
  getRemainingLockoutTime: () => number | null
}

// Rate limiting helper functions
function getLoginAttempts(): LoginAttempts {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return { count: 0, lockedUntil: null }
}

function setLoginAttempts(attempts: LoginAttempts): void {
  localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(attempts))
}

function clearLoginAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS)
}

function isAccountLocked(): { locked: boolean; remainingMs: number | null } {
  const attempts = getLoginAttempts()
  if (attempts.lockedUntil) {
    const now = Date.now()
    if (now < attempts.lockedUntil) {
      return { locked: true, remainingMs: attempts.lockedUntil - now }
    }
    // Lockout expired, clear attempts
    clearLoginAttempts()
  }
  return { locked: false, remainingMs: null }
}

function recordFailedAttempt(): { locked: boolean; attemptsRemaining: number } {
  const attempts = getLoginAttempts()
  const newCount = attempts.count + 1

  if (newCount >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    // Lock the account
    setLoginAttempts({
      count: newCount,
      lockedUntil: Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MS,
    })
    return { locked: true, attemptsRemaining: 0 }
  }

  setLoginAttempts({ count: newCount, lockedUntil: null })
  return { locked: false, attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newCount }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        // Check if account is locked due to too many failed attempts
        const lockStatus = isAccountLocked()
        if (lockStatus.locked) {
          const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000)
          set({
            isLoading: false,
            error: `Cuenta bloqueada temporalmente. Intente nuevamente en ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}.`,
          })
          return
        }

        try {
          // Find user by email
          const user = await db.users.where('email').equals(email).first()

          if (!user) {
            const result = recordFailedAttempt()
            const errorMsg = result.locked
              ? 'Cuenta bloqueada por demasiados intentos fallidos. Intente en 15 minutos.'
              : `Credenciales invalidas. Intentos restantes: ${result.attemptsRemaining}`
            set({ isLoading: false, error: errorMsg })
            return
          }

          // Check if user is active
          if (!user.activo) {
            set({ isLoading: false, error: 'Usuario inactivo' })
            return
          }

          // Verify password
          if (!verifyPassword(password, user.passwordHash)) {
            const result = recordFailedAttempt()
            const errorMsg = result.locked
              ? 'Cuenta bloqueada por demasiados intentos fallidos. Intente en 15 minutos.'
              : `Credenciales invalidas. Intentos restantes: ${result.attemptsRemaining}`
            set({ isLoading: false, error: errorMsg })
            return
          }

          // Successful login - clear failed attempts
          clearLoginAttempts()

          // Remove passwordHash from user object
          const { passwordHash: _passwordHash, ...userWithoutPassword } = user

          // Update last access
          await db.users.update(user.id, { ultimoAcceso: new Date() })

          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
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
          lastActivity: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },

      updateActivity: () => {
        if (get().isAuthenticated) {
          set({ lastActivity: Date.now() })
        }
      },

      checkSessionTimeout: () => {
        const { isAuthenticated, lastActivity, logout } = get()
        if (!isAuthenticated || !lastActivity) {
          return false
        }

        const now = Date.now()
        if (now - lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT_MS) {
          logout()
          return true
        }
        return false
      },

      getRemainingLockoutTime: () => {
        const lockStatus = isAccountLocked()
        return lockStatus.remainingMs
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
)
