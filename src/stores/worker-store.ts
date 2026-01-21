import { create } from 'zustand'
import { db, type Worker } from '@/lib/db'
import { generateId } from '@/lib/generators'

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
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: [],
  selectedWorker: null,
  isLoading: false,
  error: null,
  filter: {},

  fetchWorkers: async () => {
    set({ isLoading: true, error: null })
    try {
      const workers = await db.workers.toArray()
      set({ workers, isLoading: false })
    } catch (error) {
      set({ error: 'Error al cargar trabajadores', isLoading: false })
    }
  },

  createWorker: async (data) => {
    const newWorker: Worker = {
      ...data,
      id: generateId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    await db.workers.add(newWorker)
    set((state) => ({ workers: [...state.workers, newWorker] }))

    return newWorker
  },

  updateWorker: async (id: string, data: Partial<Worker>) => {
    const worker = await db.workers.get(id)
    if (!worker) throw new Error('Trabajador no encontrado')

    const updatedWorker = {
      ...worker,
      ...data,
      fechaActualizacion: new Date(),
    }

    await db.workers.update(id, updatedWorker)
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? updatedWorker : w)),
    }))
  },

  deleteWorker: async (id: string) => {
    await db.workers.delete(id)
    set((state) => ({
      workers: state.workers.filter((w) => w.id !== id),
      selectedWorker: state.selectedWorker?.id === id ? null : state.selectedWorker,
    }))
  },

  toggleActive: async (id: string) => {
    const worker = get().workers.find((w) => w.id === id)
    if (!worker) throw new Error('Trabajador no encontrado')

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
}))
