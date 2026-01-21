import { create } from 'zustand'
import { db, type AuditLog } from '@/lib/db'
import { generateId } from '@/lib/generators'
import type { AuditAction } from '@/types'

interface AuditFilter {
  accion?: AuditAction
  entidad?: string
  entidadId?: string
  usuarioId?: string
  fechaDesde?: Date
  fechaHasta?: Date
}

interface AuditState {
  logs: AuditLog[]
  isLoading: boolean
  error: string | null
  filter: AuditFilter
  currentPage: number
  pageSize: number

  // Actions
  fetchLogs: () => Promise<void>
  logAction: (data: {
    entidad: string
    entidadId: string
    accion: AuditAction
    usuarioId: string
    usuarioEmail: string
    cambios?: Record<string, { antes: unknown; despues: unknown }>
    descripcion?: string
  }) => Promise<AuditLog>
  setFilter: (filter: Partial<AuditFilter>) => void
  clearFilter: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void

  // Computed
  getFilteredLogs: () => AuditLog[]
  getPaginatedLogs: () => AuditLog[]
  getTotalPages: () => number
  getLogsByEntity: (entidad: string, entidadId: string) => AuditLog[]
  getLogsByUser: (usuarioId: string) => AuditLog[]
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  filter: {},
  currentPage: 1,
  pageSize: 25,

  fetchLogs: async () => {
    set({ isLoading: true, error: null })
    try {
      const logs = await db.auditLogs.orderBy('timestamp').reverse().toArray()
      set({ logs, isLoading: false })
    } catch (error) {
      set({ error: 'Error al cargar logs de auditoría', isLoading: false })
    }
  },

  logAction: async (data) => {
    const newLog: AuditLog = {
      id: generateId(),
      entidad: data.entidad,
      entidadId: data.entidadId,
      accion: data.accion,
      cambios: data.cambios,
      usuarioId: data.usuarioId,
      usuarioEmail: data.usuarioEmail,
      timestamp: new Date(),
      descripcion: data.descripcion,
    }

    await db.auditLogs.add(newLog)
    set((state) => ({ logs: [newLog, ...state.logs] }))

    return newLog
  },

  setFilter: (filter: Partial<AuditFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
      currentPage: 1,
    }))
  },

  clearFilter: () => {
    set({ filter: {}, currentPage: 1 })
  },

  setPage: (page: number) => {
    set({ currentPage: page })
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 })
  },

  getFilteredLogs: () => {
    const { logs, filter } = get()

    let filtered = [...logs]

    if (filter.accion) {
      filtered = filtered.filter((l) => l.accion === filter.accion)
    }

    if (filter.entidad) {
      filtered = filtered.filter((l) => l.entidad === filter.entidad)
    }

    if (filter.entidadId) {
      filtered = filtered.filter((l) => l.entidadId === filter.entidadId)
    }

    if (filter.usuarioId) {
      filtered = filtered.filter((l) => l.usuarioId === filter.usuarioId)
    }

    if (filter.fechaDesde) {
      filtered = filtered.filter(
        (l) => new Date(l.timestamp) >= filter.fechaDesde!
      )
    }

    if (filter.fechaHasta) {
      filtered = filtered.filter(
        (l) => new Date(l.timestamp) <= filter.fechaHasta!
      )
    }

    return filtered
  },

  getPaginatedLogs: () => {
    const { currentPage, pageSize } = get()
    const filtered = get().getFilteredLogs()

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize

    return filtered.slice(start, end)
  },

  getTotalPages: () => {
    const { pageSize } = get()
    const filtered = get().getFilteredLogs()
    return Math.ceil(filtered.length / pageSize)
  },

  getLogsByEntity: (entidad: string, entidadId: string) => {
    return get().logs.filter(
      (l) => l.entidad === entidad && l.entidadId === entidadId
    )
  },

  getLogsByUser: (usuarioId: string) => {
    return get().logs.filter((l) => l.usuarioId === usuarioId)
  },
}))

// Helper function for creating audit descriptions
export function createAuditDescription(
  accion: AuditAction,
  entidad: string,
  detalles?: string
): string {
  const accionLabels: Record<AuditAction, string> = {
    CREATE: 'Creó',
    UPDATE: 'Actualizó',
    DELETE: 'Eliminó',
    VIEW: 'Visualizó',
    LOGIN: 'Inició sesión',
    LOGOUT: 'Cerró sesión',
    STATUS_CHANGE: 'Cambió estado de',
    EXPORT: 'Exportó',
  }

  const entidadLabels: Record<string, string> = {
    documents: 'documento',
    companies: 'empresa',
    workers: 'trabajador',
    users: 'usuario',
  }

  const accionLabel = accionLabels[accion] || accion
  const entidadLabel = entidadLabels[entidad] || entidad

  return detalles
    ? `${accionLabel} ${entidadLabel}: ${detalles}`
    : `${accionLabel} ${entidadLabel}`
}
