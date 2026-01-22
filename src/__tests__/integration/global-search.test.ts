import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useWorkerStore } from '@/stores/worker-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    documents: {
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    companies: {
      toArray: vi.fn().mockResolvedValue([]),
    },
    workers: {
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

describe('Global Search Integration', () => {
  beforeEach(() => {
    // Reset stores with test data
    useDocumentStore.setState({
      documents: [
        {
          id: 'doc-001',
          codigo: 'POL-2024-00001',
          titulo: 'Politica SST Constructora ABC',
          tipo: 'POL_SST',
          estado: 'aprobado',
          empresaId: 'company-001',
          fechaCreacion: new Date('2024-01-15'),
        },
        {
          id: 'doc-002',
          codigo: 'FURAT-2024-00001',
          titulo: 'FURAT Accidente Juan Garcia',
          tipo: 'FURAT',
          estado: 'borrador',
          empresaId: 'company-001',
          trabajadorId: 'worker-001',
          fechaCreacion: new Date('2024-02-10'),
        },
        {
          id: 'doc-003',
          codigo: 'MAT-2024-00001',
          titulo: 'Matriz Peligros Transportes Norte',
          tipo: 'MAT_PEL',
          estado: 'en_revision',
          empresaId: 'company-002',
          fechaCreacion: new Date('2024-02-15'),
        },
        {
          id: 'doc-004',
          codigo: 'CAP-2024-00001',
          titulo: 'Capacitacion Trabajo en Alturas',
          tipo: 'CAP_SST',
          estado: 'aprobado',
          empresaId: 'company-001',
          fechaCreacion: new Date('2024-03-01'),
        },
      ] as any,
      isLoading: false,
      error: null,
      filters: {},
    })

    useCompanyStore.setState({
      companies: [
        {
          id: 'company-001',
          nit: '900123456',
          razonSocial: 'Constructora ABC S.A.S.',
          nombreComercial: 'Constructora ABC',
          ciudad: 'Bogota',
          activa: true,
        },
        {
          id: 'company-002',
          nit: '900234567',
          razonSocial: 'Transportes del Norte Ltda.',
          nombreComercial: 'Transnorte',
          ciudad: 'Medellin',
          activa: true,
        },
        {
          id: 'company-003',
          nit: '900345678',
          razonSocial: 'Alimentos del Valle S.A.',
          nombreComercial: 'AlimentosValle',
          ciudad: 'Cali',
          activa: false,
        },
      ] as any,
      isLoading: false,
      error: null,
    })

    useWorkerStore.setState({
      workers: [
        {
          id: 'worker-001',
          documento: '1000000001',
          nombres: 'Juan Carlos',
          apellidos: 'Garcia Perez',
          cargo: 'Ingeniero Civil',
          empresaId: 'company-001',
          activo: true,
        },
        {
          id: 'worker-002',
          documento: '1000000002',
          nombres: 'Maria Fernanda',
          apellidos: 'Lopez Rodriguez',
          cargo: 'Arquitecta',
          empresaId: 'company-001',
          activo: true,
        },
        {
          id: 'worker-003',
          documento: '1000000003',
          nombres: 'Carlos Alberto',
          apellidos: 'Martinez Gomez',
          cargo: 'Conductor',
          empresaId: 'company-002',
          activo: true,
        },
      ] as any,
      isLoading: false,
      error: null,
    })

    vi.clearAllMocks()
  })

  describe('Document search', () => {
    it('should search documents by title', () => {
      const store = useDocumentStore.getState()
      const results = store.searchDocuments('Politica')

      expect(results).toHaveLength(1)
      expect(results[0].titulo).toContain('Politica')
    })

    it('should search documents by code', () => {
      const store = useDocumentStore.getState()
      const results = store.searchDocuments('FURAT-2024')

      expect(results).toHaveLength(1)
      expect(results[0].codigo).toBe('FURAT-2024-00001')
    })

    it('should search documents case-insensitively', () => {
      const store = useDocumentStore.getState()
      const results = store.searchDocuments('politica')

      expect(results).toHaveLength(1)
      expect(results[0].titulo).toContain('Politica')
    })

    it('should return empty array for no matches', () => {
      const store = useDocumentStore.getState()
      const results = store.searchDocuments('nonexistent')

      expect(results).toHaveLength(0)
    })

    it('should search documents containing partial match', () => {
      const store = useDocumentStore.getState()
      const results = store.searchDocuments('ABC')

      expect(results).toHaveLength(1)
      expect(results[0].titulo).toContain('ABC')
    })
  })

  describe('Company search', () => {
    it('should search companies by razonSocial', () => {
      const store = useCompanyStore.getState()
      const results = store.searchCompanies('Constructora')

      expect(results).toHaveLength(1)
      expect(results[0].razonSocial).toContain('Constructora')
    })

    it('should search companies by nombreComercial', () => {
      const store = useCompanyStore.getState()
      const results = store.searchCompanies('Transnorte')

      expect(results).toHaveLength(1)
      expect(results[0].nombreComercial).toBe('Transnorte')
    })

    it('should search companies by NIT', () => {
      const store = useCompanyStore.getState()
      const results = store.searchCompanies('900123456')

      expect(results).toHaveLength(1)
      expect(results[0].nit).toBe('900123456')
    })

    it('should search companies by city', () => {
      const store = useCompanyStore.getState()
      const results = store.searchCompanies('Medellin')

      expect(results).toHaveLength(1)
      expect(results[0].ciudad).toBe('Medellin')
    })
  })

  describe('Worker search', () => {
    it('should search workers by name', () => {
      const store = useWorkerStore.getState()
      const results = store.searchWorkers('Juan')

      expect(results).toHaveLength(1)
      expect(results[0].nombres).toContain('Juan')
    })

    it('should search workers by apellido', () => {
      const store = useWorkerStore.getState()
      const results = store.searchWorkers('Garcia')

      expect(results).toHaveLength(1)
      expect(results[0].apellidos).toContain('Garcia')
    })

    it('should search workers by documento', () => {
      const store = useWorkerStore.getState()
      const results = store.searchWorkers('1000000002')

      expect(results).toHaveLength(1)
      expect(results[0].documento).toBe('1000000002')
    })

    it('should search workers by cargo', () => {
      const store = useWorkerStore.getState()
      const results = store.searchWorkers('Conductor')

      expect(results).toHaveLength(1)
      expect(results[0].cargo).toBe('Conductor')
    })
  })

  describe('Filter by company', () => {
    it('should filter documents by company', () => {
      const store = useDocumentStore.getState()
      const results = store.getDocumentsByCompany('company-001')

      expect(results).toHaveLength(3)
      expect(results.every((d) => d.empresaId === 'company-001')).toBe(true)
    })

    it('should filter workers by company', () => {
      const store = useWorkerStore.getState()
      const results = store.getWorkersByCompany('company-001')

      expect(results).toHaveLength(2)
      expect(results.every((w) => w.empresaId === 'company-001')).toBe(true)
    })
  })

  describe('Filter by status', () => {
    it('should filter documents by status', () => {
      const store = useDocumentStore.getState()
      const results = store.getDocumentsByStatus('aprobado')

      expect(results).toHaveLength(2)
      expect(results.every((d) => d.estado === 'aprobado')).toBe(true)
    })

    it('should filter active companies', () => {
      const store = useCompanyStore.getState()
      const results = store.getActiveCompanies()

      expect(results).toHaveLength(2)
      expect(results.every((c) => c.activa === true)).toBe(true)
    })

    it('should filter active workers', () => {
      const store = useWorkerStore.getState()
      const results = store.getActiveWorkers()

      expect(results).toHaveLength(3)
      expect(results.every((w) => w.activo === true)).toBe(true)
    })
  })

  describe('Combined filters', () => {
    it('should combine status and type filters', () => {
      const store = useDocumentStore.getState()
      const byStatus = store.getDocumentsByStatus('aprobado')
      const result = byStatus.filter((d) => d.tipo === 'POL_SST')

      expect(result).toHaveLength(1)
      expect(result[0].tipo).toBe('POL_SST')
      expect(result[0].estado).toBe('aprobado')
    })

    it('should combine company and status filters', () => {
      const store = useDocumentStore.getState()
      const byCompany = store.getDocumentsByCompany('company-001')
      const result = byCompany.filter((d) => d.estado === 'aprobado')

      expect(result).toHaveLength(2)
      expect(result.every((d) => d.empresaId === 'company-001' && d.estado === 'aprobado')).toBe(
        true
      )
    })

    it('should find documents related to a worker', () => {
      const store = useDocumentStore.getState()
      const workerDocs = store.documents.filter((d) => d.trabajadorId === 'worker-001')

      expect(workerDocs).toHaveLength(1)
      expect(workerDocs[0].trabajadorId).toBe('worker-001')
    })
  })

  describe('Sorting', () => {
    it('should get documents sorted by creation date', () => {
      const store = useDocumentStore.getState()
      const docs = [...store.documents].sort(
        (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      )

      expect(docs[0].codigo).toBe('CAP-2024-00001') // March 2024
      expect(docs[docs.length - 1].codigo).toBe('POL-2024-00001') // January 2024
    })
  })
})
