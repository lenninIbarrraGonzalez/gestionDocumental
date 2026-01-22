import { create } from 'zustand'
import { db, type User } from '@/lib/db'
import { generateId, hashPassword } from '@/lib/generators'
import { MODULES, ACTIONS } from '@/lib/permissions'
import {
  requirePermission,
  checkPermission,
} from '@/lib/store-permission-middleware'
import {
  handleStoreError,
  createNotFoundMessage,
} from '@/lib/error-handler'
import type { UserRole } from '@/types'

interface UserFilter {
  rol?: UserRole
  activo?: boolean
  search?: string
}

type UserWithoutHash = Omit<User, 'passwordHash'>

interface UserState {
  users: UserWithoutHash[]
  selectedUser: UserWithoutHash | null
  isLoading: boolean
  error: string | null
  filter: UserFilter

  // Actions
  fetchUsers: () => Promise<void>
  createUser: (data: {
    email: string
    password: string
    nombre: string
    apellido: string
    rol: UserRole
  }) => Promise<UserWithoutHash>
  updateUser: (id: string, data: Partial<Omit<User, 'passwordHash'>>) => Promise<void>
  updatePassword: (id: string, newPassword: string) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
  setFilter: (filter: Partial<UserFilter>) => void
  clearFilter: () => void
  selectUser: (user: UserWithoutHash | null) => void

  // Computed
  getFilteredUsers: () => UserWithoutHash[]
  getUsersByRole: (rol: UserRole) => UserWithoutHash[]
  getActiveUsers: () => UserWithoutHash[]
  getUserById: (id: string) => UserWithoutHash | undefined

  // Permission helpers
  canCreate: () => boolean
  canUpdate: () => boolean
  canDelete: () => boolean
}

const MODULE = MODULES.USERS
const LOG_PREFIX = '[user-store]'
const ENTITY_NAME = 'usuario' as const

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  filter: {},

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      requirePermission(MODULE, ACTIONS.VIEW)
      const users = await db.users.toArray()
      // Remove password hash from users
      const usersWithoutHash = users.map(({ passwordHash: _passwordHash, ...user }) => user)
      set({ users: usersWithoutHash, isLoading: false })
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'fetch', LOG_PREFIX)
      set({ error: appError.userMessage, isLoading: false })
    }
  },

  createUser: async (data) => {
    requirePermission(MODULE, ACTIONS.CREATE)

    const hashedPassword = await hashPassword(data.password)

    const newUser: User = {
      id: generateId(),
      email: data.email,
      passwordHash: hashedPassword,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol,
      activo: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    try {
      await db.users.add(newUser)
      const { passwordHash: _passwordHash, ...userWithoutHash } = newUser
      set((state) => ({ users: [...state.users, userWithoutHash] }))
      return userWithoutHash
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'create', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  updateUser: async (id: string, data: Partial<Omit<User, 'passwordHash'>>) => {
    requirePermission(MODULE, ACTIONS.EDIT)

    const user = await db.users.get(id)
    if (!user) {
      throw new Error(createNotFoundMessage(ENTITY_NAME))
    }

    const updatedUser = {
      ...user,
      ...data,
      fechaActualizacion: new Date(),
    }

    try {
      await db.users.update(id, updatedUser)
      const { passwordHash: _passwordHash, ...userWithoutHash } = updatedUser
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? userWithoutHash : u)),
      }))
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'update', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  updatePassword: async (id: string, newPassword: string) => {
    requirePermission(MODULE, ACTIONS.EDIT)

    try {
      const hashedPassword = await hashPassword(newPassword)
      await db.users.update(id, {
        passwordHash: hashedPassword,
        fechaActualizacion: new Date(),
      })
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'update', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  deleteUser: async (id: string) => {
    requirePermission(MODULE, ACTIONS.DELETE)

    try {
      await db.users.delete(id)
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
      }))
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'delete', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  toggleActive: async (id: string) => {
    const user = get().users.find((u) => u.id === id)
    if (!user) {
      throw new Error(createNotFoundMessage(ENTITY_NAME))
    }

    await get().updateUser(id, { activo: !user.activo })
  },

  setFilter: (filter: Partial<UserFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }))
  },

  clearFilter: () => {
    set({ filter: {} })
  },

  selectUser: (user: UserWithoutHash | null) => {
    set({ selectedUser: user })
  },

  getFilteredUsers: () => {
    const { users, filter } = get()

    let filtered = [...users]

    if (filter.rol) {
      filtered = filtered.filter((u) => u.rol === filter.rol)
    }

    if (filter.activo !== undefined) {
      filtered = filtered.filter((u) => u.activo === filter.activo)
    }

    if (filter.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.nombre.toLowerCase().includes(search) ||
          u.apellido.toLowerCase().includes(search)
      )
    }

    return filtered
  },

  getUsersByRole: (rol: UserRole) => {
    return get().users.filter((u) => u.rol === rol)
  },

  getActiveUsers: () => {
    return get().users.filter((u) => u.activo)
  },

  getUserById: (id: string) => {
    return get().users.find((u) => u.id === id)
  },

  // Permission helpers
  canCreate: () => checkPermission(MODULE, ACTIONS.CREATE),
  canUpdate: () => checkPermission(MODULE, ACTIONS.EDIT),
  canDelete: () => checkPermission(MODULE, ACTIONS.DELETE),
}))
