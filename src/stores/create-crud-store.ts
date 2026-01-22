import { create, type StateCreator } from 'zustand'
import { generateId } from '@/lib/generators'
import { db } from '@/lib/db'
import type { Table } from 'dexie'

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
}

/**
 * Configuration for creating a CRUD store
 */
export interface CrudStoreConfig<T extends BaseEntity, F extends BaseFilter> {
  /** Name of the entity (for error messages) */
  entityName: string
  /** Dexie table to use for persistence */
  getTable: () => Table<T>
  /** Initial filter state */
  initialFilter: F
  /** Function to filter items based on filter state */
  filterFn: (item: T, filter: F) => boolean
  /** Function to search items based on a query string */
  searchFn: (item: T, query: string) => boolean
}

/**
 * Creates a reusable CRUD store with common operations
 */
export function createCrudStore<T extends BaseEntity, F extends BaseFilter>(
  config: CrudStoreConfig<T, F>
) {
  const { entityName, getTable, initialFilter, filterFn, searchFn } = config

  return create<CrudStoreState<T, F>>((set, get) => ({
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
    filter: initialFilter,

    fetch: async () => {
      set({ isLoading: true, error: null })
      try {
        const items = await getTable().toArray()
        set({ items, isLoading: false })
      } catch (error) {
        console.error(`Error fetching ${entityName}:`, error)
        set({ error: `Error al cargar ${entityName}`, isLoading: false })
      }
    },

    create: async (data) => {
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
        console.error(`Error creating ${entityName}:`, error)
        throw new Error(`Error al crear ${entityName}`)
      }
    },

    update: async (id: string, data: Partial<T>) => {
      const item = await getTable().get(id)
      if (!item) {
        throw new Error(`${entityName} no encontrado`)
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
        console.error(`Error updating ${entityName}:`, error)
        throw new Error(`Error al actualizar ${entityName}`)
      }
    },

    remove: async (id: string) => {
      try {
        await getTable().delete(id)
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        }))
      } catch (error) {
        console.error(`Error deleting ${entityName}:`, error)
        throw new Error(`Error al eliminar ${entityName}`)
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
  }))
}

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
