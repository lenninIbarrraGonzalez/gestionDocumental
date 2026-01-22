import { describe, it, expect } from 'vitest'
import { ReportService } from './report-service'

const mockDocuments = [
  {
    id: '1',
    codigo: 'DOC-2024-00001',
    titulo: 'Politica SST',
    tipo: 'POL_SST',
    estado: 'aprobado',
    empresaId: '1',
    fechaCreacion: new Date('2024-01-15'),
  },
  {
    id: '2',
    codigo: 'DOC-2024-00002',
    titulo: 'FURAT Accidente',
    tipo: 'FURAT',
    estado: 'borrador',
    empresaId: '1',
    fechaCreacion: new Date('2024-01-20'),
  },
  {
    id: '3',
    codigo: 'DOC-2024-00003',
    titulo: 'Matriz Peligros',
    tipo: 'MAT_PEL',
    estado: 'aprobado',
    empresaId: '2',
    fechaCreacion: new Date('2024-02-10'),
  },
  {
    id: '4',
    codigo: 'DOC-2024-00004',
    titulo: 'FURAT Otro',
    tipo: 'FURAT',
    estado: 'rechazado',
    empresaId: '2',
    fechaCreacion: new Date('2024-02-15'),
  },
]

describe('ReportService', () => {
  describe('generateStatusReport', () => {
    it('should generate report grouped by status', () => {
      const report = ReportService.generateStatusReport(mockDocuments as any)

      expect(report.aprobado).toBe(2)
      expect(report.borrador).toBe(1)
      expect(report.rechazado).toBe(1)
    })

    it('should handle empty documents array', () => {
      const report = ReportService.generateStatusReport([])

      expect(Object.keys(report)).toHaveLength(0)
    })
  })

  describe('generateTypeReport', () => {
    it('should generate report grouped by type', () => {
      const report = ReportService.generateTypeReport(mockDocuments as any)

      expect(report.POL_SST).toBe(1)
      expect(report.FURAT).toBe(2)
      expect(report.MAT_PEL).toBe(1)
    })
  })

  describe('generateCompanyReport', () => {
    it('should generate report grouped by company', () => {
      const report = ReportService.generateCompanyReport(mockDocuments as any)

      expect(report['1']).toBe(2)
      expect(report['2']).toBe(2)
    })
  })

  describe('generateMonthlyReport', () => {
    it('should generate report grouped by month', () => {
      const report = ReportService.generateMonthlyReport(mockDocuments as any)

      expect(report['2024-01']).toBe(2)
      expect(report['2024-02']).toBe(2)
    })
  })

  describe('filterDocuments', () => {
    it('should filter by status', () => {
      const filtered = ReportService.filterDocuments(mockDocuments as any, {
        estado: 'aprobado',
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.every((d) => d.estado === 'aprobado')).toBe(true)
    })

    it('should filter by type', () => {
      const filtered = ReportService.filterDocuments(mockDocuments as any, {
        tipo: 'FURAT',
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.every((d) => d.tipo === 'FURAT')).toBe(true)
    })

    it('should filter by company', () => {
      const filtered = ReportService.filterDocuments(mockDocuments as any, {
        empresaId: '1',
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.every((d) => d.empresaId === '1')).toBe(true)
    })

    it('should filter by date range', () => {
      const filtered = ReportService.filterDocuments(mockDocuments as any, {
        fechaDesde: new Date('2024-02-01'),
        fechaHasta: new Date('2024-02-28'),
      })

      expect(filtered).toHaveLength(2)
    })
  })

  describe('exportToCSV', () => {
    it('should generate CSV string with headers', () => {
      const csv = ReportService.exportToCSV(mockDocuments as any)

      expect(csv).toContain('Codigo,Titulo,Tipo,Estado,Empresa,Fecha')
      expect(csv).toContain('DOC-2024-00001')
      expect(csv).toContain('Politica SST')
    })

    it('should handle empty array', () => {
      const csv = ReportService.exportToCSV([])

      expect(csv).toContain('Codigo,Titulo,Tipo,Estado,Empresa,Fecha')
    })

    it('should escape quotes in titles', () => {
      const docsWithQuotes = [
        {
          id: '1',
          codigo: 'DOC-001',
          titulo: 'Document with "quotes" inside',
          tipo: 'POL_SST',
          estado: 'borrador',
          empresaId: '1',
          fechaCreacion: new Date('2024-01-01'),
        },
      ]
      const csv = ReportService.exportToCSV(docsWithQuotes as any)

      expect(csv).toContain('""quotes""')
    })

    it('should handle unknown type and status', () => {
      const docsWithUnknown = [
        {
          id: '1',
          codigo: 'DOC-001',
          titulo: 'Test',
          tipo: 'UNKNOWN_TYPE',
          estado: 'unknown_status',
          empresaId: '1',
          fechaCreacion: new Date('2024-01-01'),
        },
      ]
      const csv = ReportService.exportToCSV(docsWithUnknown as any)

      expect(csv).toContain('UNKNOWN_TYPE')
      expect(csv).toContain('unknown_status')
    })
  })

  describe('generateSummaryReport', () => {
    it('should generate complete summary', () => {
      const summary = ReportService.generateSummaryReport(mockDocuments as any)

      expect(summary.total).toBe(4)
      expect(summary.byStatus).toBeDefined()
      expect(summary.byType).toBeDefined()
      expect(summary.byCompany).toBeDefined()
      expect(summary.byMonth).toBeDefined()
    })
  })

  describe('exportToJSON', () => {
    it('should generate valid JSON string', () => {
      const docsWithAllFields = mockDocuments.map((d) => ({
        ...d,
        fechaActualizacion: d.fechaCreacion,
      }))
      const json = ReportService.exportToJSON(docsWithAllFields as any)
      const parsed = JSON.parse(json)

      expect(parsed).toBeInstanceOf(Array)
      expect(parsed).toHaveLength(4)
      expect(parsed[0]).toHaveProperty('codigo')
      expect(parsed[0]).toHaveProperty('titulo')
    })

    it('should handle unknown type and status', () => {
      const docsWithUnknown = [
        {
          id: '1',
          codigo: 'DOC-001',
          titulo: 'Test',
          tipo: 'UNKNOWN_TYPE',
          estado: 'unknown_status',
          empresaId: '1',
          fechaCreacion: new Date('2024-01-01'),
          fechaActualizacion: new Date('2024-01-01'),
        },
      ]
      const json = ReportService.exportToJSON(docsWithUnknown as any)
      const parsed = JSON.parse(json)

      expect(parsed[0].tipo).toBe('UNKNOWN_TYPE')
      expect(parsed[0].estado).toBe('unknown_status')
    })
  })

  describe('calculateKPIs', () => {
    it('should calculate KPIs correctly', () => {
      const kpis = ReportService.calculateKPIs(mockDocuments as any)

      expect(kpis.totalDocuments).toBe(4)
      expect(kpis.approvedDocuments).toBe(2)
      expect(kpis.rejectedDocuments).toBe(1)
      expect(kpis.pendingDocuments).toBe(1) // borrador
      expect(kpis.approvalRate).toBe(67) // 2 approved / 3 reviewed * 100
    })

    it('should handle empty documents', () => {
      const kpis = ReportService.calculateKPIs([])

      expect(kpis.totalDocuments).toBe(0)
      expect(kpis.approvalRate).toBe(0)
    })

    it('should handle documents with all statuses', () => {
      const docsAllStatuses = [
        { id: '1', estado: 'borrador' },
        { id: '2', estado: 'pendiente_revision' },
        { id: '3', estado: 'en_revision' },
        { id: '4', estado: 'requiere_correccion' },
        { id: '5', estado: 'aprobado' },
        { id: '6', estado: 'rechazado' },
      ]
      const kpis = ReportService.calculateKPIs(docsAllStatuses as any)

      expect(kpis.pendingDocuments).toBe(4) // borrador + pendiente + en_revision + requiere
      expect(kpis.approvedDocuments).toBe(1)
      expect(kpis.rejectedDocuments).toBe(1)
    })
  })

  describe('getTrendData', () => {
    it('should generate trend data for last N months', () => {
      const trend = ReportService.getTrendData(mockDocuments as any, 6)

      expect(trend).toHaveLength(6)
      expect(trend[0]).toHaveProperty('month')
      expect(trend[0]).toHaveProperty('count')
    })

    it('should handle empty documents', () => {
      const trend = ReportService.getTrendData([], 3)

      expect(trend).toHaveLength(3)
      expect(trend.every((t) => t.count === 0)).toBe(true)
    })

    it('should use default 6 months when not specified', () => {
      const trend = ReportService.getTrendData(mockDocuments as any)

      expect(trend).toHaveLength(6)
    })
  })
})
