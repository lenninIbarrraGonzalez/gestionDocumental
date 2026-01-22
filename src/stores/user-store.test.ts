import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useUserStore } from './user-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    users: {
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    },
  },
}))

// Mock generators
vi.mock('@/lib/generators', () => ({
  generateId: () => 'test-id',
  hashPassword: (pwd: string) => `hashed_${pwd}`,
}))

// Mock auth store with admin permissions
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: { id: '1', rol: 'admin' },
    })),
  },
}))

describe('UserStore', () => {
  beforeEach(() => {
    // Reset store
    useUserStore.setState({
      users: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      filter: {},
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useUserStore.getState()

      expect(state.users).toEqual([])
      expect(state.selectedUser).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('filter operations', () => {
    it('should set filter', () => {
      const { setFilter } = useUserStore.getState()

      act(() => {
        setFilter({ rol: 'admin', activo: true })
      })

      const state = useUserStore.getState()
      expect(state.filter.rol).toBe('admin')
      expect(state.filter.activo).toBe(true)
    })

    it('should clear filter', () => {
      useUserStore.setState({
        filter: { rol: 'admin', activo: true },
      })

      const { clearFilter } = useUserStore.getState()

      act(() => {
        clearFilter()
      })

      expect(useUserStore.getState().filter).toEqual({})
    })
  })

  describe('selection', () => {
    it('should select user', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        nombre: 'Test',
        apellido: 'User',
        rol: 'admin',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      }

      const { selectUser } = useUserStore.getState()

      act(() => {
        selectUser(mockUser as any)
      })

      expect(useUserStore.getState().selectedUser).toEqual(mockUser)
    })
  })

  describe('getFilteredUsers', () => {
    const mockUsers = [
      {
        id: '1',
        email: 'admin@test.com',
        nombre: 'Admin',
        apellido: 'User',
        rol: 'admin',
        activo: true,
      },
      {
        id: '2',
        email: 'supervisor@test.com',
        nombre: 'Super',
        apellido: 'Visor',
        rol: 'supervisor',
        activo: false,
      },
      {
        id: '3',
        email: 'digitador@test.com',
        nombre: 'Digi',
        apellido: 'Tador',
        rol: 'digitador',
        activo: true,
      },
    ]

    beforeEach(() => {
      useUserStore.setState({ users: mockUsers as any })
    })

    it('should filter by rol', () => {
      useUserStore.setState({ filter: { rol: 'admin' } })

      const filtered = useUserStore.getState().getFilteredUsers()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].rol).toBe('admin')
    })

    it('should filter by activo status', () => {
      useUserStore.setState({ filter: { activo: true } })

      const filtered = useUserStore.getState().getFilteredUsers()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((u) => u.activo === true)).toBe(true)
    })

    it('should filter by search term in email', () => {
      useUserStore.setState({ filter: { search: 'supervisor' } })

      const filtered = useUserStore.getState().getFilteredUsers()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].email).toBe('supervisor@test.com')
    })

    it('should filter by search term in nombre', () => {
      useUserStore.setState({ filter: { search: 'digi' } })

      const filtered = useUserStore.getState().getFilteredUsers()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].nombre).toBe('Digi')
    })
  })

  describe('getUsersByRole', () => {
    it('should return users with specific role', () => {
      const mockUsers = [
        { id: '1', rol: 'admin' },
        { id: '2', rol: 'supervisor' },
        { id: '3', rol: 'admin' },
      ]

      useUserStore.setState({ users: mockUsers as any })

      const admins = useUserStore.getState().getUsersByRole('admin')

      expect(admins).toHaveLength(2)
      expect(admins.every((u) => u.rol === 'admin')).toBe(true)
    })
  })

  describe('getActiveUsers', () => {
    it('should return only active users', () => {
      const mockUsers = [
        { id: '1', activo: true },
        { id: '2', activo: false },
        { id: '3', activo: true },
      ]

      useUserStore.setState({ users: mockUsers as any })

      const active = useUserStore.getState().getActiveUsers()

      expect(active).toHaveLength(2)
      expect(active.every((u) => u.activo === true)).toBe(true)
    })
  })

  describe('getUserById', () => {
    it('should return user by id', () => {
      const mockUsers = [
        { id: '1', nombre: 'User 1' },
        { id: '2', nombre: 'User 2' },
      ]

      useUserStore.setState({ users: mockUsers as any })

      const user = useUserStore.getState().getUserById('2')

      expect(user?.nombre).toBe('User 2')
    })
  })

  describe('fetchUsers', () => {
    it('should fetch users from database', async () => {
      const { db } = await import('@/lib/db')
      const mockUsers = [
        { id: '1', nombre: 'User 1', passwordHash: 'hash1' },
        { id: '2', nombre: 'User 2', passwordHash: 'hash2' },
      ]
      vi.mocked(db.users.toArray).mockResolvedValue(mockUsers as any)

      await act(async () => {
        await useUserStore.getState().fetchUsers()
      })

      const state = useUserStore.getState()
      expect(state.users).toHaveLength(2)
      expect(state.isLoading).toBe(false)
      // Users should not have passwordHash
      expect(state.users[0]).not.toHaveProperty('passwordHash')
    })

    it('should set error on fetch failure', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.toArray).mockRejectedValue(new Error('DB error'))

      await act(async () => {
        await useUserStore.getState().fetchUsers()
      })

      const state = useUserStore.getState()
      expect(state.error).toBe('Error al cargar los usuarios')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.add).mockResolvedValue(undefined as any)

      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        rol: 'digitador' as const,
      }

      const result = await useUserStore.getState().createUser(userData)

      expect(result.email).toBe('newuser@test.com')
      expect(result.id).toBe('test-id')
      expect(useUserStore.getState().users).toHaveLength(1)
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const { db } = await import('@/lib/db')
      const existingUser = {
        id: '1',
        nombre: 'Old Name',
        apellido: 'User',
        email: 'test@test.com',
        rol: 'digitador',
        activo: true,
      }
      vi.mocked(db.users.get).mockResolvedValue(existingUser as any)
      vi.mocked(db.users.update).mockResolvedValue(1)

      useUserStore.setState({
        users: [existingUser as any],
      })

      await act(async () => {
        await useUserStore.getState().updateUser('1', { nombre: 'New Name' })
      })

      const user = useUserStore.getState().users[0]
      expect(user.nombre).toBe('New Name')
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.delete).mockResolvedValue(undefined)

      useUserStore.setState({
        users: [{ id: '1', nombre: 'User 1' } as any],
        selectedUser: { id: '1' } as any,
      })

      await act(async () => {
        await useUserStore.getState().deleteUser('1')
      })

      const state = useUserStore.getState()
      expect(state.users).toHaveLength(0)
      expect(state.selectedUser).toBeNull()
    })
  })

  describe('toggleActive', () => {
    it('should toggle user active status', async () => {
      const { db } = await import('@/lib/db')
      const existingUser = {
        id: '1',
        nombre: 'Test User',
        activo: true,
      }
      vi.mocked(db.users.get).mockResolvedValue(existingUser as any)
      vi.mocked(db.users.update).mockResolvedValue(1)

      useUserStore.setState({
        users: [existingUser as any],
      })

      await act(async () => {
        await useUserStore.getState().toggleActive('1')
      })

      const user = useUserStore.getState().users[0]
      expect(user.activo).toBe(false)
    })
  })

  describe('updatePassword', () => {
    it('should call db.users.update with new password hash', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.users.update).mockResolvedValue(1)

      await act(async () => {
        await useUserStore.getState().updatePassword('1', 'newPassword123')
      })

      expect(db.users.update).toHaveBeenCalled()
    })
  })
})
