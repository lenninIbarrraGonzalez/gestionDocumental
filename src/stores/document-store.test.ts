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

// Mock auth store with admin permissions
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: { id: '1', rol: 'admin' },
    })),
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

  describe('fetchDocuments', () => {
    it('should fetch documents from database', async () => {
      const { db } = await import('@/lib/db')
      const mockDocuments = [
        { id: '1', titulo: 'Document 1', estado: 'borrador' },
        { id: '2', titulo: 'Document 2', estado: 'aprobado' },
      ]
      vi.mocked(db.documents.toArray).mockResolvedValue(mockDocuments as any)

      await act(async () => {
        await useDocumentStore.getState().fetchDocuments()
      })

      const state = useDocumentStore.getState()
      expect(state.documents).toHaveLength(2)
      expect(state.isLoading).toBe(false)
    })

    it('should set error on fetch failure', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.documents.toArray).mockRejectedValue(new Error('DB error'))

      await act(async () => {
        await useDocumentStore.getState().fetchDocuments()
      })

      const state = useDocumentStore.getState()
      expect(state.error).toBe('Error al cargar los documentos')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.documents.add).mockResolvedValue(undefined as any)
      vi.mocked(db.documents.toArray).mockResolvedValue([])

      const documentData = {
        titulo: 'New Document',
        tipo: 'POL_SST',
        empresaId: 'company-1',
        descripcion: 'Test description',
      }

      const result = await useDocumentStore.getState().createDocument(documentData as any, 'user-1')

      expect(result.titulo).toBe('New Document')
      expect(result.estado).toBe('borrador')
      expect(result.version).toBe(1)
      expect(useDocumentStore.getState().documents).toHaveLength(1)
    })
  })

  describe('updateDocument', () => {
    it('should update an existing document', async () => {
      const { db } = await import('@/lib/db')
      const existingDocument = {
        id: '1',
        titulo: 'Old Title',
        tipo: 'POL_SST',
        estado: 'borrador',
        version: 1,
      }
      vi.mocked(db.documents.get).mockResolvedValue(existingDocument as any)
      vi.mocked(db.documents.update).mockResolvedValue(1)

      useDocumentStore.setState({ documents: [existingDocument as any] })

      await act(async () => {
        await useDocumentStore.getState().updateDocument('1', { titulo: 'New Title' }, 'user-1')
      })

      const document = useDocumentStore.getState().documents[0]
      expect(document.titulo).toBe('New Title')
    })

    it('should throw error for non-existent document', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.documents.get).mockResolvedValue(undefined)

      await expect(
        useDocumentStore.getState().updateDocument('999', { titulo: 'New Title' }, 'user-1')
      ).rejects.toThrow('Documento no encontrado')
    })
  })

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.documents.delete).mockResolvedValue(undefined)

      useDocumentStore.setState({
        documents: [{ id: '1', titulo: 'Document 1' } as any],
        selectedDocument: { id: '1' } as any,
      })

      await act(async () => {
        await useDocumentStore.getState().deleteDocument('1')
      })

      const state = useDocumentStore.getState()
      expect(state.documents).toHaveLength(0)
      expect(state.selectedDocument).toBeNull()
    })
  })

  describe('getTotalPages', () => {
    it('should calculate total pages correctly', () => {
      const mockDocuments = Array.from({ length: 45 }, (_, i) => ({
        id: `${i + 1}`,
        titulo: `Document ${i + 1}`,
      }))

      useDocumentStore.setState({
        documents: mockDocuments as any,
        pageSize: 10,
      })

      const totalPages = useDocumentStore.getState().getTotalPages()

      expect(totalPages).toBe(5)
    })
  })

  describe('getDocumentsByCompany', () => {
    it('should return documents for specific company', () => {
      const mockDocuments = [
        { id: '1', empresaId: 'company-1' },
        { id: '2', empresaId: 'company-2' },
        { id: '3', empresaId: 'company-1' },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const companyDocs = useDocumentStore.getState().getDocumentsByCompany('company-1')

      expect(companyDocs).toHaveLength(2)
      expect(companyDocs.every((d) => d.empresaId === 'company-1')).toBe(true)
    })
  })

  describe('getDocumentsByType', () => {
    it('should return documents of specific type', () => {
      const mockDocuments = [
        { id: '1', tipo: 'POL_SST' },
        { id: '2', tipo: 'FURAT' },
        { id: '3', tipo: 'POL_SST' },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const typeDocs = useDocumentStore.getState().getDocumentsByType('POL_SST')

      expect(typeDocs).toHaveLength(2)
      expect(typeDocs.every((d) => d.tipo === 'POL_SST')).toBe(true)
    })
  })

  describe('searchDocuments', () => {
    it('should search documents by title', () => {
      const mockDocuments = [
        { id: '1', titulo: 'Politica de Seguridad', codigo: 'DOC-001', descripcion: 'Desc 1' },
        { id: '2', titulo: 'Matriz de Peligros', codigo: 'DOC-002', descripcion: 'Desc 2' },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const results = useDocumentStore.getState().searchDocuments('politica')

      expect(results).toHaveLength(1)
      expect(results[0].titulo).toBe('Politica de Seguridad')
    })

    it('should search documents by code', () => {
      const mockDocuments = [
        { id: '1', titulo: 'Doc 1', codigo: 'DOC-001', descripcion: 'Desc 1' },
        { id: '2', titulo: 'Doc 2', codigo: 'DOC-002', descripcion: 'Desc 2' },
      ]

      useDocumentStore.setState({ documents: mockDocuments as any })

      const results = useDocumentStore.getState().searchDocuments('DOC-002')

      expect(results).toHaveLength(1)
      expect(results[0].codigo).toBe('DOC-002')
    })
  })

  describe('filter by date range', () => {
    it('should filter documents by fechaDesde', () => {
      const mockDocuments = [
        { id: '1', titulo: 'Doc 1', fechaCreacion: new Date('2024-01-01') },
        { id: '2', titulo: 'Doc 2', fechaCreacion: new Date('2024-06-01') },
      ]

      useDocumentStore.setState({
        documents: mockDocuments as any,
        filter: { fechaDesde: new Date('2024-05-01') },
      })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('2')
    })

    it('should filter documents by fechaHasta', () => {
      const mockDocuments = [
        { id: '1', titulo: 'Doc 1', fechaCreacion: new Date('2024-01-01') },
        { id: '2', titulo: 'Doc 2', fechaCreacion: new Date('2024-06-01') },
      ]

      useDocumentStore.setState({
        documents: mockDocuments as any,
        filter: { fechaHasta: new Date('2024-03-01') },
      })

      const filtered = useDocumentStore.getState().getFilteredDocuments()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })
  })
})
