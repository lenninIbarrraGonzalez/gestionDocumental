import { create } from 'zustand'
import { db, type Worker } from '@/lib/db'
import { generateId } from '@/lib/generators'
import { MODULES, ACTIONS } from '@/lib/permissions'
import {
  requirePermission,
  checkPermission,
} from '@/lib/store-permission-middleware'
import {
  handleStoreError,
  createNotFoundMessage,
} from '@/lib/error-handler'

interface WorkerFilter {
  empresaId?: string
  activo?: boolean
  cargo?: string
  search?: string
}

interface WorkerState {
  workers: Worker[]
  selectedWorker: Worker | null
  isLoading: boolean
  error: string | null
  filter: WorkerFilter

  // Actions
  fetchWorkers: () => Promise<void>
  createWorker: (data: Omit<Worker, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => Promise<Worker>
  updateWorker: (id: string, data: Partial<Worker>) => Promise<void>
  deleteWorker: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
  setFilter: (filter: Partial<WorkerFilter>) => void
  clearFilter: () => void
  selectWorker: (worker: Worker | null) => void

  // Computed
  getFilteredWorkers: () => Worker[]
  getWorkersByCompany: (empresaId: string) => Worker[]
  getActiveWorkers: () => Worker[]
  getWorkerById: (id: string) => Worker | undefined
  searchWorkers: (query: string) => Worker[]

  // Permission helpers
  canCreate: () => boolean
  canUpdate: () => boolean
  canDelete: () => boolean
}

const MODULE = MODULES.WORKERS
const LOG_PREFIX = '[worker-store]'
const ENTITY_NAME = 'trabajador' as const

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: [],
  selectedWorker: null,
  isLoading: false,
  error: null,
  filter: {},

  fetchWorkers: async () => {
    set({ isLoading: true, error: null })
    try {
      requirePermission(MODULE, ACTIONS.VIEW)
      const workers = await db.workers.toArray()
      set({ workers, isLoading: false })
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'fetch', LOG_PREFIX)
      set({ error: appError.userMessage, isLoading: false })
    }
  },

  createWorker: async (data) => {
    requirePermission(MODULE, ACTIONS.CREATE)

    const newWorker: Worker = {
      ...data,
      id: generateId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    try {
      await db.workers.add(newWorker)
      set((state) => ({ workers: [...state.workers, newWorker] }))
      return newWorker
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'create', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  updateWorker: async (id: string, data: Partial<Worker>) => {
    requirePermission(MODULE, ACTIONS.EDIT)

    const worker = await db.workers.get(id)
    if (!worker) {
      throw new Error(createNotFoundMessage(ENTITY_NAME))
    }

    const updatedWorker = {
      ...worker,
      ...data,
      fechaActualizacion: new Date(),
    }

    try {
      await db.workers.update(id, updatedWorker)
      set((state) => ({
        workers: state.workers.map((w) => (w.id === id ? updatedWorker : w)),
      }))
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'update', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  deleteWorker: async (id: string) => {
    requirePermission(MODULE, ACTIONS.DELETE)

    try {
      await db.workers.delete(id)
      set((state) => ({
        workers: state.workers.filter((w) => w.id !== id),
        selectedWorker: state.selectedWorker?.id === id ? null : state.selectedWorker,
      }))
    } catch (error) {
      const appError = handleStoreError(error, ENTITY_NAME, 'delete', LOG_PREFIX)
      throw new Error(appError.userMessage)
    }
  },

  toggleActive: async (id: string) => {
    const worker = get().workers.find((w) => w.id === id)
    if (!worker) {
      throw new Error(createNotFoundMessage(ENTITY_NAME))
    }

    await get().updateWorker(id, { activo: !worker.activo })
  },

  setFilter: (filter: Partial<WorkerFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }))
  },

  clearFilter: () => {
    set({ filter: {} })
  },

  selectWorker: (worker: Worker | null) => {
    set({ selectedWorker: worker })
  },

  getFilteredWorkers: () => {
    const { workers, filter } = get()

    let filtered = [...workers]

    if (filter.empresaId) {
      filtered = filtered.filter((w) => w.empresaId === filter.empresaId)
    }

    if (filter.activo !== undefined) {
      filtered = filtered.filter((w) => w.activo === filter.activo)
    }

    if (filter.cargo) {
      filtered = filtered.filter((w) => w.cargo === filter.cargo)
    }

    if (filter.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(
        (w) =>
          w.nombres.toLowerCase().includes(search) ||
          w.apellidos.toLowerCase().includes(search) ||
          w.documento.includes(search)
      )
    }

    return filtered
  },

  getWorkersByCompany: (empresaId: string) => {
    return get().workers.filter((w) => w.empresaId === empresaId)
  },

  getActiveWorkers: () => {
    return get().workers.filter((w) => w.activo)
  },

  getWorkerById: (id: string) => {
    return get().workers.find((w) => w.id === id)
  },

  searchWorkers: (query: string) => {
    const search = query.toLowerCase()
    return get().workers.filter(
      (w) =>
        w.nombres.toLowerCase().includes(search) ||
        w.apellidos.toLowerCase().includes(search) ||
        w.documento.includes(search) ||
        w.cargo.toLowerCase().includes(search)
    )
  },

  // Permission helpers
  canCreate: () => checkPermission(MODULE, ACTIONS.CREATE),
  canUpdate: () => checkPermission(MODULE, ACTIONS.EDIT),
  canDelete: () => checkPermission(MODULE, ACTIONS.DELETE),
}))
