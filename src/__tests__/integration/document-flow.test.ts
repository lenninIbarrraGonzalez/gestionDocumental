import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useWorkerStore } from '@/stores/worker-store'
import { useAuditStore } from '@/stores/audit-store'
import { WorkflowService } from '@/lib/services/workflow-service'
import { DOCUMENT_STATUS } from '@/lib/constants'

// Mock auth store with admin permissions
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: { id: '1', rol: 'admin' },
    })),
  },
}))

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    documents: {
      add: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    companies: {
      add: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      toArray: vi.fn().mockResolvedValue([]),
    },
    workers: {
      add: vi.fn().mockResolvedValue(undefined),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    auditLogs: {
      add: vi.fn().mockResolvedValue(undefined),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    workflowHistory: {
      add: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

describe('Document Flow Integration', () => {
  beforeEach(() => {
    // Reset all stores
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
    useCompanyStore.setState({
      companies: [],
      selectedCompany: null,
      isLoading: false,
      error: null,
      filter: {},
    })
    useWorkerStore.setState({
      workers: [],
      selectedWorker: null,
      isLoading: false,
      error: null,
      filter: {},
    })
    useAuditStore.setState({
      logs: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
    })
    vi.clearAllMocks()
  })

  describe('Complete document lifecycle', () => {
    it('should create a document in draft status', async () => {
      const store = useDocumentStore.getState()

      const document = await store.createDocument(
        {
          titulo: 'Test Document',
          tipo: 'POL_SST',
          empresaId: 'company-001',
        },
        'user-001'
      )

      expect(document.estado).toBe(DOCUMENT_STATUS.BORRADOR)
      expect(document.version).toBe(1)
      expect(document.codigo).toMatch(/^POL-\d{4}-\d{5}$/)
    })

    it('should transition document through approval workflow', async () => {
      const store = useDocumentStore.getState()

      // Create document
      const document = await store.createDocument(
        {
          titulo: 'Politica SST 2024',
          tipo: 'POL_SST',
          empresaId: 'company-001',
        },
        'user-digitador-001'
      )

      expect(document.estado).toBe(DOCUMENT_STATUS.BORRADOR)

      // Send for review
      const transition1 = WorkflowService.executeSimpleTransition(
        document.id,
        document.estado as 'borrador',
        'ENVIAR_REVISION',
        'user-digitador-001'
      )
      expect(transition1.estadoNuevo).toBe(DOCUMENT_STATUS.PENDIENTE_REVISION)

      // Start review
      const transition2 = WorkflowService.executeSimpleTransition(
        document.id,
        transition1.estadoNuevo as 'pendiente_revision',
        'INICIAR_REVISION',
        'user-supervisor-001'
      )
      expect(transition2.estadoNuevo).toBe(DOCUMENT_STATUS.EN_REVISION)

      // Approve
      const transition3 = WorkflowService.executeSimpleTransition(
        document.id,
        transition2.estadoNuevo as 'en_revision',
        'APROBAR',
        'user-supervisor-001',
        'Documento correcto y completo'
      )
      expect(transition3.estadoNuevo).toBe(DOCUMENT_STATUS.APROBADO)
    })

    it('should handle document rejection and correction', async () => {
      const store = useDocumentStore.getState()

      // Create and send for review
      const document = await store.createDocument(
        {
          titulo: 'FURAT Accidente',
          tipo: 'FURAT',
          empresaId: 'company-001',
        },
        'user-digitador-001'
      )

      // Fast-forward to EN_REVISION
      const transition1 = WorkflowService.executeSimpleTransition(
        document.id,
        'borrador',
        'ENVIAR_REVISION',
        'user-digitador-001'
      )
      const transition2 = WorkflowService.executeSimpleTransition(
        document.id,
        transition1.estadoNuevo as 'pendiente_revision',
        'INICIAR_REVISION',
        'user-supervisor-001'
      )

      // Reject
      const rejection = WorkflowService.executeSimpleTransition(
        document.id,
        transition2.estadoNuevo as 'en_revision',
        'RECHAZAR',
        'user-supervisor-001',
        'Falta firma del empleador'
      )
      expect(rejection.estadoNuevo).toBe(DOCUMENT_STATUS.RECHAZADO)
    })

    it('should handle correction request workflow', () => {
      // Start from EN_REVISION
      const transition1 = WorkflowService.executeSimpleTransition(
        'doc-001',
        'en_revision',
        'SOLICITAR_CORRECCION',
        'user-supervisor-001',
        'Corregir fecha de accidente'
      )
      expect(transition1.estadoNuevo).toBe(DOCUMENT_STATUS.REQUIERE_CORRECCION)

      // Submit correction
      const transition2 = WorkflowService.executeSimpleTransition(
        'doc-001',
        'requiere_correccion',
        'CORREGIR',
        'user-digitador-001',
        'Fecha corregida'
      )
      expect(transition2.estadoNuevo).toBe(DOCUMENT_STATUS.PENDIENTE_REVISION)
    })
  })

  describe('Workflow validation', () => {
    it('should prevent invalid transitions', () => {
      // Cannot approve a draft
      expect(() => {
        WorkflowService.executeSimpleTransition('doc-001', 'borrador', 'APROBAR', 'user-001')
      }).toThrow()

      // Cannot reject a draft
      expect(() => {
        WorkflowService.executeSimpleTransition('doc-001', 'borrador', 'RECHAZAR', 'user-001')
      }).toThrow()
    })

    it('should validate available actions for each status', () => {
      const draftActions = WorkflowService.getAvailableActions('borrador')
      expect(draftActions).toContain('ENVIAR_REVISION')
      expect(draftActions).not.toContain('APROBAR')

      const reviewActions = WorkflowService.getAvailableActions('en_revision')
      expect(reviewActions).toContain('APROBAR')
      expect(reviewActions).toContain('RECHAZAR')
      expect(reviewActions).toContain('SOLICITAR_CORRECCION')
    })
  })

  describe('Document filtering', () => {
    it('should filter documents by status', () => {
      useDocumentStore.setState({
        documents: [
          { id: '1', estado: 'borrador', tipo: 'POL_SST', empresaId: '1' },
          { id: '2', estado: 'aprobado', tipo: 'FURAT', empresaId: '1' },
          { id: '3', estado: 'borrador', tipo: 'MAT_PEL', empresaId: '2' },
        ] as any,
      })

      const store = useDocumentStore.getState()
      const drafts = store.getDocumentsByStatus('borrador')

      expect(drafts).toHaveLength(2)
      expect(drafts.every((d) => d.estado === 'borrador')).toBe(true)
    })

    it('should filter documents by company', () => {
      useDocumentStore.setState({
        documents: [
          { id: '1', estado: 'borrador', tipo: 'POL_SST', empresaId: 'company-001' },
          { id: '2', estado: 'aprobado', tipo: 'FURAT', empresaId: 'company-002' },
          { id: '3', estado: 'borrador', tipo: 'MAT_PEL', empresaId: 'company-001' },
        ] as any,
      })

      const store = useDocumentStore.getState()
      const company1Docs = store.getDocumentsByCompany('company-001')

      expect(company1Docs).toHaveLength(2)
      expect(company1Docs.every((d) => d.empresaId === 'company-001')).toBe(true)
    })

    it('should filter documents by type', () => {
      useDocumentStore.setState({
        documents: [
          { id: '1', estado: 'borrador', tipo: 'POL_SST', empresaId: '1' },
          { id: '2', estado: 'aprobado', tipo: 'FURAT', empresaId: '1' },
          { id: '3', estado: 'borrador', tipo: 'FURAT', empresaId: '2' },
        ] as any,
      })

      const store = useDocumentStore.getState()
      const furats = store.getDocumentsByType('FURAT')

      expect(furats).toHaveLength(2)
      expect(furats.every((d) => d.tipo === 'FURAT')).toBe(true)
    })

    it('should search documents by text', () => {
      useDocumentStore.setState({
        documents: [
          { id: '1', titulo: 'Politica SST 2024', codigo: 'POL-2024-00001', tipo: 'POL_SST' },
          { id: '2', titulo: 'FURAT Accidente', codigo: 'FURAT-2024-00001', tipo: 'FURAT' },
          { id: '3', titulo: 'Matriz de Peligros', codigo: 'MAT-2024-00001', tipo: 'MAT_PEL' },
        ] as any,
      })

      const store = useDocumentStore.getState()
      const results = store.searchDocuments('Politica')

      expect(results).toHaveLength(1)
      expect(results[0].titulo).toContain('Politica')
    })
  })

  describe('Expiring documents', () => {
    it('should identify documents expiring within specified days', () => {
      const today = new Date()
      const in10Days = new Date(today)
      in10Days.setDate(today.getDate() + 10)

      const in60Days = new Date(today)
      in60Days.setDate(today.getDate() + 60)

      useDocumentStore.setState({
        documents: [
          { id: '1', titulo: 'Doc 1', estado: 'aprobado', fechaVigencia: in10Days },
          { id: '2', titulo: 'Doc 2', estado: 'aprobado', fechaVigencia: in60Days },
          { id: '3', titulo: 'Doc 3', estado: 'aprobado' }, // No expiration
        ] as any,
      })

      const store = useDocumentStore.getState()
      const expiring30 = store.getExpiringDocuments(30)

      expect(expiring30).toHaveLength(1)
      expect(expiring30[0].id).toBe('1')
    })

    it('should identify expired documents', () => {
      const today = new Date()
      const expired = new Date(today)
      expired.setDate(today.getDate() - 5)

      const future = new Date(today)
      future.setDate(today.getDate() + 30)

      useDocumentStore.setState({
        documents: [
          { id: '1', titulo: 'Expired Doc', estado: 'aprobado', fechaVigencia: expired },
          { id: '2', titulo: 'Valid Doc', estado: 'aprobado', fechaVigencia: future },
        ] as any,
      })

      const store = useDocumentStore.getState()
      const expiredDocs = store.getExpiredDocuments()

      expect(expiredDocs).toHaveLength(1)
      expect(expiredDocs[0].id).toBe('1')
    })
  })
})
