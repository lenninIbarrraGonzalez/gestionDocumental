import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth-store'
import { useAuditStore } from '@/stores/audit-store'
import { hashPassword, verifyPassword } from '@/lib/generators'
import { STORAGE_KEYS } from '@/lib/constants'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    users: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
      update: vi.fn().mockResolvedValue(undefined),
    },
    auditLogs: {
      add: vi.fn().mockResolvedValue(undefined),
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
}))

// Pre-compute the hash for consistent test results
const testPasswordHash = hashPassword('Admin123!')

describe('Authentication Flow Integration', () => {
  const mockUser = {
    id: 'user-admin-001',
    email: 'admin@arl.com',
    passwordHash: testPasswordHash,
    nombre: 'Carlos',
    apellido: 'Rodriguez',
    rol: 'admin' as const,
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }

  beforeEach(() => {
    // Clear login attempts storage before each test
    localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS)

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: null,
    })
    useAuditStore.setState({
      logs: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
    })
    vi.clearAllMocks()
  })

  describe('Login flow', () => {
    it('should successfully login with valid credentials', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockUser),
        }),
      } as any)

      const store = useAuthStore.getState()
      await store.login('admin@arl.com', 'Admin123!')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('admin@arl.com')
      expect(state.error).toBeNull()
    })

    it('should fail login with invalid password', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockUser),
        }),
      } as any)

      const store = useAuthStore.getState()
      await store.login('admin@arl.com', 'wrongpassword')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.error).toContain('Credenciales invalidas')
    })

    it('should fail login with non-existent user', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as any)

      const store = useAuthStore.getState()
      await store.login('noexiste@arl.com', 'password')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toContain('Credenciales invalidas')
    })

    it('should fail login with inactive user', async () => {
      const inactiveUser = { ...mockUser, activo: false }
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(inactiveUser),
        }),
      } as any)

      const store = useAuthStore.getState()
      await store.login('admin@arl.com', 'Admin123!')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toContain('inactivo')
    })
  })

  describe('Logout flow', () => {
    it('should clear user data on logout', async () => {
      // First, set authenticated state
      useAuthStore.setState({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nombre: mockUser.nombre,
          apellido: mockUser.apellido,
          rol: mockUser.rol,
        },
        isAuthenticated: true,
      })

      const store = useAuthStore.getState()
      store.logout()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })
  })

  describe('Session persistence', () => {
    it('should persist user session', () => {
      useAuthStore.setState({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nombre: mockUser.nombre,
          apellido: mockUser.apellido,
          rol: mockUser.rol,
        },
        isAuthenticated: true,
      })

      // Simulate getting state (as if from persisted storage)
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('admin@arl.com')
    })
  })

  describe('Role-based access', () => {
    it('should correctly identify admin role', () => {
      useAuthStore.setState({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nombre: mockUser.nombre,
          apellido: mockUser.apellido,
          rol: 'admin',
        },
        isAuthenticated: true,
      })

      const state = useAuthStore.getState()
      expect(state.user?.rol).toBe('admin')
    })

    it('should correctly identify supervisor role', () => {
      useAuthStore.setState({
        user: {
          id: 'user-supervisor-001',
          email: 'supervisor@arl.com',
          nombre: 'Maria',
          apellido: 'Gonzalez',
          rol: 'supervisor',
        },
        isAuthenticated: true,
      })

      const state = useAuthStore.getState()
      expect(state.user?.rol).toBe('supervisor')
    })

    it('should correctly identify digitador role', () => {
      useAuthStore.setState({
        user: {
          id: 'user-digitador-001',
          email: 'digitador@arl.com',
          nombre: 'Juan',
          apellido: 'Martinez',
          rol: 'digitador',
        },
        isAuthenticated: true,
      })

      const state = useAuthStore.getState()
      expect(state.user?.rol).toBe('digitador')
    })

    it('should correctly identify consultor role', () => {
      useAuthStore.setState({
        user: {
          id: 'user-consultor-001',
          email: 'consultor@arl.com',
          nombre: 'Ana',
          apellido: 'Lopez',
          rol: 'consultor',
        },
        isAuthenticated: true,
      })

      const state = useAuthStore.getState()
      expect(state.user?.rol).toBe('consultor')
    })
  })

  describe('Password handling', () => {
    it('should hash and verify password correctly', () => {
      const password = 'SecurePassword123!'
      const hash = hashPassword(password)

      expect(hash).not.toBe(password)
      expect(verifyPassword(password, hash)).toBe(true)
      expect(verifyPassword('wrongpassword', hash)).toBe(false)
    })

    it('should generate different hashes for same password (bcrypt uses random salt)', () => {
      const password = 'TestPassword123!'
      const hash1 = hashPassword(password)
      const hash2 = hashPassword(password)

      // bcrypt generates unique hashes due to random salts
      expect(hash1).not.toBe(hash2)
      // But both should verify correctly
      expect(verifyPassword(password, hash1)).toBe(true)
      expect(verifyPassword(password, hash2)).toBe(true)
    })
  })
})
