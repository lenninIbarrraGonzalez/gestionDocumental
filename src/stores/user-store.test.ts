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
  generateId: vi.fn().mockReturnValue('test-id'),
  hashPassword: vi.fn().mockImplementation((pwd) => Promise.resolve(`hashed_${pwd}`)),
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
})
