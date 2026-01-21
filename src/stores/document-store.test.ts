import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useDocumentStore } from './document-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    documents: {
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('DocumentStore', () => {
  beforeEach(() => {
    // Reset store
    useDocumentStore.setState({
      documents: [],
      selectedDocument: null,
      isLoading: false,
      error: null,
      filter: {},
      sortField: 'fechaCreacion',
      sortDirection: 'desc',
      currentPage: 1,
      pageSize: 10,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useDocumentStore.getState()

      expect(state.documents).toEqual([])
      expect(state.selectedDocument).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.currentPage).toBe(1)
      expect(state.pageSize).toBe(10)
    })
  })

  describe('filter operations', () => {
    it('should set filter', () => {
      const { setFilter } = useDocumentStore.getState()

      act(() => {
        setFilter({ estado: 'aprobado', tipo: 'FURAT' })
      })

      const state = useDocumentStore.getState()
      expect(state.filter.estado).toBe('aprobado')
      expect(state.filter.tipo).toBe('FURAT')
    })

    it('should clear filter', () => {
      useDocumentStore.setState({
        filter: { estado: 'aprobado', tipo: 'FURAT' },
      })

      const { clearFilter } = useDocumentStore.getState()

      act(() => {
        clearFilter()
      })

      expect(useDocumentStore.getState().filter).toEqual({})
    })

    it('should reset page when setting filter', () => {
      useDocumentStore.setState({ currentPage: 5 })

      const { setFilter } = useDocumentStore.getState()

      act(() => {
        setFilter({ estado: 'borrador' })
      })

      expect(useDocumentStore.getState().currentPage).toBe(1)
    })
  })

  describe('pagination', () => {
    it('should set page', () => {
      const { setPage } = useDocumentStore.getState()

      act(() => {
        setPage(3)
      })

      expect(useDocumentStore.getState().currentPage).toBe(3)
    })

    it('should set page size and reset to page 1', () => {
      useDocumentStore.setState({ currentPage: 5 })

      const { setPageSize } = useDocumentStore.getState()

      act(() => {
        setPageSize(25)
      })

      const state = useDocumentStore.getState()
      expect(state.pageSize).toBe(25)
      expect(state.currentPage).toBe(1)
    })
  })

  describe('sorting', () => {
    it('should set sort field and direction', () => {
      const { setSort } = useDocumentStore.getState()

      act(() => {
        setSort('titulo', 'asc')
      })

      const state = useDocumentStore.getState()
      expect(state.sortField).toBe('titulo')
      expect(state.sortDirection).toBe('asc')
    })
  })

  describe('selection', () => {
    it('should select document', () => {
      const mockDocument = {
        id: '1',
        codigo: 'DOC-2024-00001',
        titulo: 'Test',
        tipo: 'POL_SST',
        estado: 'borrador',
        empresaId: '1',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: '1',
        version: 1,
      }

      const { selectDocument } = useDocumentStore.getState()

      act(() => {
        selectDocument(mockDocument as any)
      })

      expect(useDocumentStore.getState().selectedDocument).toEqual(mockDocument)
    })

    it('should deselect document', () => {
      useDocumentStore.setState({
        selectedDocument: { id: '1' } as any,
      })

      const { selectDocument } = useDocumentStore.getState()

      act(() => {
        selectDocument(null)
      })

      expect(useDocumentStore.getState().selectedDocument).toBeNull()
    })
  })

  describe('getFilteredDocuments', () => {
    const mockDocuments = [
      {
        id: '1',
        codigo: 'DOC-2024-00001',
        titulo: 'Politica SST',
        tipo: 'POL_SST',
        estado: 'aprobado',
        empresaId: '1',
        fechaCreacion: new Date('2024-01-15'),
        fechaActualizacion: new Date(),
        creadoPor: '1',
        version: 1,
      },
      {
        id: '2',
        codigo: 'DOC-2024-00002',
        titulo: 'FURAT Accidente',
        tipo: 'FURAT',
        estado: 'borrador',
        empresaId: '2',
        fechaCreacion: new Date('2024-01-20'),
        fechaActualizacion: new Date(),
        creadoPor: '1',
        version: 1,
      },
      {
        id: '3',
        codigo: 'DOC-2024-00003',
        titulo: 'Matriz Peligros',
        tipo: 'MAT_PEL',
        estado: 'aprobado',
        empresaId: '1',
        fechaCreacion: new Date('2024-01-10'),
        fechaActualizacion: new Date(),
        creadoPor: '1',
        version: 1,
      },
    ]

    beforeEach(() => {
      useDocumentStore.setState({ documents: mockDocuments as any })
    })

    it('should filter by estado', () => {
      useDocumentStore.setState({ filter: { estado: 'aprobado' } })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((d) => d.estado === 'aprobado')).toBe(true)
    })

    it('should filter by tipo', () => {
      useDocumentStore.setState({ filter: { tipo: 'FURAT' } })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].tipo).toBe('FURAT')
    })

    it('should filter by empresaId', () => {
      useDocumentStore.setState({ filter: { empresaId: '1' } })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((d) => d.empresaId === '1')).toBe(true)
    })

    it('should filter by search term', () => {
      useDocumentStore.setState({ filter: { search: 'politica' } })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].titulo).toBe('Politica SST')
    })

    it('should sort by field ascending', () => {
      useDocumentStore.setState({
        filter: {},
        sortField: 'fechaCreacion',
        sortDirection: 'asc',
      })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered[0].id).toBe('3') // Oldest first
    })

    it('should sort by field descending', () => {
      useDocumentStore.setState({
        filter: {},
        sortField: 'fechaCreacion',
        sortDirection: 'desc',
      })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered[0].id).toBe('2') // Newest first
    })
  })

  describe('getPaginatedDocuments', () => {
    it('should return correct page of documents', () => {
      const mockDocuments = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        codigo: `DOC-2024-${String(i + 1).padStart(5, '0')}`,
        titulo: `Document ${i + 1}`,
        tipo: 'POL_SST',
        estado: 'borrador',
        empresaId: '1',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: '1',
        version: 1,
      }))

      useDocumentStore.setState({
        documents: mockDocuments as any,
        currentPage: 2,
        pageSize: 10,
      })

      const paginated = useDocumentStore.getState().getPaginatedDocuments()

      expect(paginated).toHaveLength(10)
    })
  })

  describe('getDocumentsByStatus', () => {
    it('should return documents with specific status', () => {
      const mockDocuments = [
        { id: '1', estado: 'aprobado' },
        { id: '2', estado: 'borrador' },
        { id: '3', estado: 'aprobado' },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const approved = useDocumentStore
        .getState()
        .getDocumentsByStatus('aprobado')

      expect(approved).toHaveLength(2)
    })
  })

  describe('getExpiringDocuments', () => {
    it('should return documents expiring within days', () => {
      const now = new Date()
      const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
      const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)

      const mockDocuments = [
        { id: '1', fechaVigencia: in5Days },
        { id: '2', fechaVigencia: in15Days },
        { id: '3', fechaVigencia: null },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const expiring = useDocumentStore.getState().getExpiringDocuments(7)

      expect(expiring).toHaveLength(1)
      expect(expiring[0].id).toBe('1')
    })
  })

  describe('getExpiredDocuments', () => {
    it('should return expired documents', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

      const mockDocuments = [
        { id: '1', fechaVigencia: pastDate },
        { id: '2', fechaVigencia: futureDate },
        { id: '3', fechaVigencia: null },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const expired = useDocumentStore.getState().getExpiredDocuments()

      expect(expired).toHaveLength(1)
      expect(expired[0].id).toBe('1')
    })
  })
})
