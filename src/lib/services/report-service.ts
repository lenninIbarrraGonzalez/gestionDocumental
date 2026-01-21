import type { Document } from '@/lib/db'
import { DOCUMENT_TYPES, STATUS_CONFIG } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import type { DocumentStatus } from '@/types'

interface ReportFilter {
  estado?: DocumentStatus
  tipo?: string
  empresaId?: string
  fechaDesde?: Date
  fechaHasta?: Date
}

interface SummaryReport {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byCompany: Record<string, number>
  byMonth: Record<string, number>
}

export class ReportService {
  /**
   * Generate a report grouped by document status
   */
  static generateStatusReport(documents: Document[]): Record<string, number> {
    return documents.reduce(
      (acc, doc) => {
        acc[doc.estado] = (acc[doc.estado] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  /**
   * Generate a report grouped by document type
   */
  static generateTypeReport(documents: Document[]): Record<string, number> {
    return documents.reduce(
      (acc, doc) => {
        acc[doc.tipo] = (acc[doc.tipo] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  /**
   * Generate a report grouped by company
   */
  static generateCompanyReport(documents: Document[]): Record<string, number> {
    return documents.reduce(
      (acc, doc) => {
        acc[doc.empresaId] = (acc[doc.empresaId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  /**
   * Generate a report grouped by month
   */
  static generateMonthlyReport(documents: Document[]): Record<string, number> {
    return documents.reduce(
      (acc, doc) => {
        const date = new Date(doc.fechaCreacion)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        acc[monthKey] = (acc[monthKey] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  /**
   * Generate a complete summary report
   */
  static generateSummaryReport(documents: Document[]): SummaryReport {
    return {
      total: documents.length,
      byStatus: this.generateStatusReport(documents),
      byType: this.generateTypeReport(documents),
      byCompany: this.generateCompanyReport(documents),
      byMonth: this.generateMonthlyReport(documents),
    }
  }

  /**
   * Filter documents based on criteria
   */
  static filterDocuments(documents: Document[], filter: ReportFilter): Document[] {
    let filtered = [...documents]

    if (filter.estado) {
      filtered = filtered.filter((d) => d.estado === filter.estado)
    }

    if (filter.tipo) {
      filtered = filtered.filter((d) => d.tipo === filter.tipo)
    }

    if (filter.empresaId) {
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

    return filtered
  }

  /**
   * Export documents to CSV format
   */
  static exportToCSV(documents: Document[]): string {
    const headers = ['Codigo', 'Titulo', 'Tipo', 'Estado', 'Empresa', 'Fecha']
    const rows = documents.map((doc) => [
      doc.codigo,
      `"${doc.titulo.replace(/"/g, '""')}"`,
      DOCUMENT_TYPES[doc.tipo as keyof typeof DOCUMENT_TYPES] || doc.tipo,
      STATUS_CONFIG[doc.estado as keyof typeof STATUS_CONFIG]?.label || doc.estado,
      doc.empresaId,
      formatDate(doc.fechaCreacion),
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }

  /**
   * Export documents to JSON format
   */
  static exportToJSON(documents: Document[]): string {
    const exportData = documents.map((doc) => ({
      codigo: doc.codigo,
      titulo: doc.titulo,
      tipo: DOCUMENT_TYPES[doc.tipo as keyof typeof DOCUMENT_TYPES] || doc.tipo,
      estado: STATUS_CONFIG[doc.estado as keyof typeof STATUS_CONFIG]?.label || doc.estado,
      empresaId: doc.empresaId,
      fechaCreacion: formatDate(doc.fechaCreacion),
      fechaActualizacion: formatDate(doc.fechaActualizacion),
    }))

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Calculate KPIs from documents
   */
  static calculateKPIs(documents: Document[]): {
    totalDocuments: number
    approvedDocuments: number
    rejectedDocuments: number
    pendingDocuments: number
    approvalRate: number
    averageProcessingTime?: number
  } {
    const statusCounts = this.generateStatusReport(documents)

    const approved = statusCounts['aprobado'] || 0
    const rejected = statusCounts['rechazado'] || 0
    const pending =
      (statusCounts['borrador'] || 0) +
      (statusCounts['pendiente_revision'] || 0) +
      (statusCounts['en_revision'] || 0) +
      (statusCounts['requiere_correccion'] || 0)

    const totalReviewed = approved + rejected
    const approvalRate = totalReviewed > 0 ? (approved / totalReviewed) * 100 : 0

    return {
      totalDocuments: documents.length,
      approvedDocuments: approved,
      rejectedDocuments: rejected,
      pendingDocuments: pending,
      approvalRate: Math.round(approvalRate),
    }
  }

  /**
   * Get trend data for charts (last N months)
   */
  static getTrendData(
    documents: Document[],
    months: number = 6
  ): Array<{ month: string; count: number }> {
    const now = new Date()
    const trendData: Array<{ month: string; count: number }> = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const count = documents.filter((doc) => {
        const docDate = new Date(doc.fechaCreacion)
        return (
          docDate.getFullYear() === date.getFullYear() &&
          docDate.getMonth() === date.getMonth()
        )
      }).length

      trendData.push({
        month: monthKey,
        count,
      })
    }

    return trendData
  }
}
