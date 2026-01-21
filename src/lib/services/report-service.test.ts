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
  })
})
