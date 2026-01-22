import { create } from 'zustand'
import { db, type Document } from '@/lib/db'
import { generateId, generateDocumentCode } from '@/lib/generators'
import { DOCUMENT_STATUS, DOCUMENT_PREFIXES } from '@/lib/constants'
import type { DocumentStatus, CreateDocumentDTO, UpdateDocumentDTO } from '@/types'

interface DocumentFilter {
  estado?: DocumentStatus | 'all'
  tipo?: string | 'all'
  empresaId?: string | 'all'
  fechaDesde?: Date
  fechaHasta?: Date
  search?: string
}

interface DocumentState {
  documents: Document[]
  selectedDocument: Document | null
  isLoading: boolean
  error: string | null
  filter: DocumentFilter
  sortField: string
  sortDirection: 'asc' | 'desc'
  currentPage: number
  pageSize: number

  // Actions
  fetchDocuments: () => Promise<void>
  getDocumentById: (id: string) => Promise<Document | null>
  createDocument: (data: CreateDocumentDTO, userId: string) => Promise<Document>
  updateDocument: (id: string, data: UpdateDocumentDTO, userId: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  changeStatus: (id: string, newStatus: DocumentStatus, userId: string) => Promise<void>
  setFilter: (filter: Partial<DocumentFilter>) => void
  clearFilter: () => void
  setSort: (field: string, direction: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  selectDocument: (document: Document | null) => void

  // Computed
  getFilteredDocuments: () => Document[]
  getPaginatedDocuments: () => Document[]
  getTotalPages: () => number
  getDocumentsByStatus: (status: DocumentStatus) => Document[]
  getDocumentsByCompany: (empresaId: string) => Document[]
  getDocumentsByType: (tipo: string) => Document[]
  searchDocuments: (query: string) => Document[]
  getExpiringDocuments: (days: number) => Document[]
  getExpiredDocuments: () => Document[]
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  selectedDocument: null,
  isLoading: false,
  error: null,
  filter: {},
  sortField: 'fechaCreacion',
  sortDirection: 'desc',
  currentPage: 1,
  pageSize: 10,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null })
    try {
      const documents = await db.documents.toArray()
      set({ documents, isLoading: false })
    } catch (error) {
      set({ error: 'Error al cargar documentos', isLoading: false })
    }
  },

  getDocumentById: async (id: string) => {
    try {
      const document = await db.documents.get(id)
      return document || null
    } catch {
      return null
    }
  },

  createDocument: async (data: CreateDocumentDTO, userId: string) => {
    const year = new Date().getFullYear()
    const prefix = DOCUMENT_PREFIXES[data.tipo] || DOCUMENT_PREFIXES.default

    // Get next sequence number
    const existingDocs = get().documents.filter((d) =>
      d.codigo.startsWith(`${prefix}-${year}`)
    )
    const nextSequence = existingDocs.length + 1

    const newDocument: Document = {
      id: generateId(),
      codigo: generateDocumentCode(prefix, year, nextSequence),
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      estado: DOCUMENT_STATUS.BORRADOR,
      empresaId: data.empresaId,
      trabajadorId: data.trabajadorId,
      fechaVigencia: data.fechaVigencia,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      creadoPor: userId,
      version: 1,
    }

    await db.documents.add(newDocument)
    set((state) => ({ documents: [...state.documents, newDocument] }))

    return newDocument
  },

  updateDocument: async (id: string, data: UpdateDocumentDTO, userId: string) => {
    const document = await db.documents.get(id)
    if (!document) throw new Error('Documento no encontrado')

    const updatedDocument = {
      ...document,
      ...data,
      fechaActualizacion: new Date(),
      actualizadoPor: userId,
    }

    await db.documents.update(id, updatedDocument)
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? updatedDocument : d
      ),
    }))
  },

  deleteDocument: async (id: string) => {
    await db.documents.delete(id)
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      selectedDocument:
        state.selectedDocument?.id === id ? null : state.selectedDocument,
    }))
  },

  changeStatus: async (id: string, newStatus: DocumentStatus, userId: string) => {
    const document = await db.documents.get(id)
    if (!document) throw new Error('Documento no encontrado')

    const updatedDocument = {
      ...document,
      estado: newStatus,
      fechaActualizacion: new Date(),
      actualizadoPor: userId,
    }

    await db.documents.update(id, updatedDocument)
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? updatedDocument : d
      ),
    }))
  },

  setFilter: (filter: Partial<DocumentFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
      currentPage: 1,
    }))
  },

  clearFilter: () => {
    set({ filter: {}, currentPage: 1 })
  },

  setSort: (field: string, direction: 'asc' | 'desc') => {
    set({ sortField: field, sortDirection: direction })
  },

  setPage: (page: number) => {
    set({ currentPage: page })
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 })
  },

  selectDocument: (document: Document | null) => {
    set({ selectedDocument: document })
  },

  getFilteredDocuments: () => {
    const { documents, filter, sortField, sortDirection } = get()

    let filtered = [...documents]

    // Apply filters
    if (filter.estado && filter.estado !== 'all') {
      filtered = filtered.filter((d) => d.estado === filter.estado)
    }

    if (filter.tipo && filter.tipo !== 'all') {
      filtered = filtered.filter((d) => d.tipo === filter.tipo)
    }

    if (filter.empresaId && filter.empresaId !== 'all') {
      filtered = filtered.filter((d) => d.empresaId === filter.empresaId)
    }

    if (filter.fechaDesde) {
      filtered = filtered.filter(
        (d) => new Date(d.fechaCreacion) >= filter.fechaDesde!
      )
    }

    if (filter.fechaHasta) {
      filtered = filtered.filter(
        (d) => new Date(d.fechaCreacion) <= filter.fechaHasta!
      )
    }

    if (filter.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.titulo.toLowerCase().includes(search) ||
          d.codigo.toLowerCase().includes(search) ||
          d.descripcion?.toLowerCase().includes(search)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof Document]
      const bValue = b[sortField as keyof Document]

      if (aValue === undefined || bValue === undefined) return 0

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  },

  getPaginatedDocuments: () => {
    const { currentPage, pageSize } = get()
    const filtered = get().getFilteredDocuments()

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize

    return filtered.slice(start, end)
  },

  getTotalPages: () => {
    const { pageSize } = get()
    const filtered = get().getFilteredDocuments()
    return Math.ceil(filtered.length / pageSize)
  },

  getDocumentsByStatus: (status: DocumentStatus) => {
    return get().documents.filter((d) => d.estado === status)
  },

  getDocumentsByCompany: (empresaId: string) => {
    return get().documents.filter((d) => d.empresaId === empresaId)
  },

  getDocumentsByType: (tipo: string) => {
    return get().documents.filter((d) => d.tipo === tipo)
  },

  searchDocuments: (query: string) => {
    const search = query.toLowerCase()
    return get().documents.filter(
      (d) =>
        d.titulo.toLowerCase().includes(search) ||
        d.codigo.toLowerCase().includes(search) ||
        d.descripcion?.toLowerCase().includes(search)
    )
  },

  getExpiringDocuments: (days: number) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return get().documents.filter((d) => {
      if (!d.fechaVigencia) return false
      const vigencia = new Date(d.fechaVigencia)
      return vigencia > now && vigencia <= futureDate
    })
  },

  getExpiredDocuments: () => {
    const now = new Date()
    return get().documents.filter((d) => {
      if (!d.fechaVigencia) return false
      return new Date(d.fechaVigencia) < now
    })
  },
}))
