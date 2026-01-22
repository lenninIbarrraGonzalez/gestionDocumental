import { create, type StateCreator } from 'zustand'
import { generateId } from '@/lib/generators'
import { db } from '@/lib/db'
import type { Table } from 'dexie'
import {
  requirePermission,
  checkPermission,
  type CrudPermissionConfig,
  DEFAULT_CRUD_PERMISSIONS,
} from '@/lib/store-permission-middleware'
import {
  handleStoreError,
  createNotFoundMessage,
  type EntityName,
} from '@/lib/error-handler'
import { ACTIONS, type Module } from '@/lib/permissions'

/**
 * Base entity interface - all entities must have these fields
 */
export interface BaseEntity {
  id: string
  fechaCreacion: Date
  fechaActualizacion: Date
}

/**
 * Base filter interface
 */
export interface BaseFilter {
  search?: string
}

/**
 * CRUD Store state interface
 */
export interface CrudStoreState<T extends BaseEntity, F extends BaseFilter> {
  items: T[]
  selectedItem: T | null
  isLoading: boolean
  error: string | null
  filter: F

  // Actions
  fetch: () => Promise<void>
  create: (data: Omit<T, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<void>
  remove: (id: string) => Promise<void>
  setFilter: (filter: Partial<F>) => void
  clearFilter: () => void
  select: (item: T | null) => void

  // Computed
  getFiltered: () => T[]
  getById: (id: string) => T | undefined
  search: (query: string) => T[]

  // Permission helpers
  canCreate: () => boolean
  canUpdate: () => boolean
  canDelete: () => boolean
}

/**
 * Configuration for creating a CRUD store
 */
export interface CrudStoreConfig<T extends BaseEntity, F extends BaseFilter> {
  /** Name of the entity (for error messages) */
  entityName: EntityName
  /** Dexie table to use for persistence */
  getTable: () => Table<T>
  /** Initial filter state */
  initialFilter: F
  /** Function to filter items based on filter state */
  filterFn: (item: T, filter: F) => boolean
  /** Function to search items based on a query string */
  searchFn: (item: T, query: string) => boolean
  /** Permission configuration */
  permissions: CrudPermissionConfig
}

/**
 * Creates a reusable CRUD store with common operations
 * Includes permission validation and consistent error handling
 */
export function createCrudStore<T extends BaseEntity, F extends BaseFilter>(
  config: CrudStoreConfig<T, F>
) {
  const {
    entityName,
    getTable,
    initialFilter,
    filterFn,
    searchFn,
    permissions,
  } = config

  const {
    module,
    createAction = DEFAULT_CRUD_PERMISSIONS.createAction,
    readAction = DEFAULT_CRUD_PERMISSIONS.readAction,
    updateAction = DEFAULT_CRUD_PERMISSIONS.updateAction,
    deleteAction = DEFAULT_CRUD_PERMISSIONS.deleteAction,
  } = permissions

  const logPrefix = `[${entityName}-store]`

  return create<CrudStoreState<T, F>>((set, get) => ({
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
    filter: initialFilter,

    fetch: async () => {
      set({ isLoading: true, error: null })
      try {
        // Check read permission
        if (readAction) {
          requirePermission(module, readAction)
        }

        const items = await getTable().toArray()
        set({ items, isLoading: false })
      } catch (error) {
        const appError = handleStoreError(error, entityName, 'fetch', logPrefix)
        set({ error: appError.userMessage, isLoading: false })
      }
    },

    create: async (data) => {
      // Check create permission
      if (createAction) {
        requirePermission(module, createAction)
      }

      const newItem = {
        ...data,
        id: generateId(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      } as T

      try {
        await getTable().add(newItem)
        set((state) => ({ items: [...state.items, newItem] }))
        return newItem
      } catch (error) {
        const appError = handleStoreError(error, entityName, 'create', logPrefix)
        throw new Error(appError.userMessage)
      }
    },

    update: async (id: string, data: Partial<T>) => {
      // Check update permission
      if (updateAction) {
        requirePermission(module, updateAction)
      }

      const item = await getTable().get(id)
      if (!item) {
        throw new Error(createNotFoundMessage(entityName))
      }

      const updatedItem = {
        ...item,
        ...data,
        fechaActualizacion: new Date(),
      } as T

      try {
        await getTable().put(updatedItem)
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? updatedItem : i)),
        }))
      } catch (error) {
        const appError = handleStoreError(error, entityName, 'update', logPrefix)
        throw new Error(appError.userMessage)
      }
    },

    remove: async (id: string) => {
      // Check delete permission
      if (deleteAction) {
        requirePermission(module, deleteAction)
      }

      try {
        await getTable().delete(id)
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        }))
      } catch (error) {
        const appError = handleStoreError(error, entityName, 'delete', logPrefix)
        throw new Error(appError.userMessage)
      }
    },

    setFilter: (filter: Partial<F>) => {
      set((state) => ({
        filter: { ...state.filter, ...filter },
      }))
    },

    clearFilter: () => {
      set({ filter: initialFilter })
    },

    select: (item: T | null) => {
      set({ selectedItem: item })
    },

    getFiltered: () => {
      const { items, filter } = get()
      return items.filter((item) => filterFn(item, filter))
    },

    getById: (id: string) => {
      return get().items.find((i) => i.id === id)
    },

    search: (query: string) => {
      const searchLower = query.toLowerCase()
      return get().items.filter((item) => searchFn(item, searchLower))
    },

    // Permission helpers for UI
    canCreate: () => createAction ? checkPermission(module, createAction) : true,
    canUpdate: () => updateAction ? checkPermission(module, updateAction) : true,
    canDelete: () => deleteAction ? checkPermission(module, deleteAction) : true,
  }))
}

/**
 * Helper type to get the state type from a CRUD store
 */
export type CrudStoreStateType<T extends BaseEntity, F extends BaseFilter> =
  CrudStoreState<T, F>

/**
 * Extends a CRUD store with additional actions and state
 */
export function extendCrudStore<
  T extends BaseEntity,
  F extends BaseFilter,
  E extends object
>(
  baseCreator: StateCreator<CrudStoreState<T, F>>,
  extension: (
    set: Parameters<StateCreator<CrudStoreState<T, F> & E>>[0],
    get: Parameters<StateCreator<CrudStoreState<T, F> & E>>[1]
  ) => E
): StateCreator<CrudStoreState<T, F> & E> {
  return (set, get, api) => ({
    ...baseCreator(set as Parameters<typeof baseCreator>[0], get as Parameters<typeof baseCreator>[1], api as Parameters<typeof baseCreator>[2]),
    ...extension(set, get),
  })
}

/**
 * Configuration builder for easy store creation
 */
export function configureCrudStore<T extends BaseEntity>() {
  return {
    forEntity: (entityName: EntityName) => ({
      withTable: (getTable: () => Table<T>) => ({
        withModule: (module: Module) => ({
          withFilter: <F extends BaseFilter>(
            initialFilter: F,
            filterFn: (item: T, filter: F) => boolean,
            searchFn: (item: T, query: string) => boolean
          ): CrudStoreConfig<T, F> => ({
            entityName,
            getTable,
            initialFilter,
            filterFn,
            searchFn,
            permissions: {
              module,
              ...DEFAULT_CRUD_PERMISSIONS,
            },
          }),
        }),
      }),
    }),
  }
}
