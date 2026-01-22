import { useMemo, useCallback } from 'react'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useWorkerStore } from '@/stores/worker-store'
import { groupByCount } from '@/lib/utils/group-by'

interface DashboardStats {
  totalDocuments: number
  documentsByStatus: Record<string, number>
  documentsByType: Record<string, number>
  documentsByCompany: Record<string, number>
  activeCompanies: number
  totalCompanies: number
  activeWorkers: number
  totalWorkers: number
  expiringDocuments: number
  expiredDocuments: number
  approvalRate: number
}

export function useDashboardStats(): DashboardStats {
  const documents = useDocumentStore((state) => state.documents)
  const getExpiringDocuments = useDocumentStore((state) => state.getExpiringDocuments)
  const getExpiredDocuments = useDocumentStore((state) => state.getExpiredDocuments)
  const companies = useCompanyStore((state) => state.companies)
  const getActiveCompanies = useCompanyStore((state) => state.getActiveCompanies)
  const workers = useWorkerStore((state) => state.workers)
  const getActiveWorkers = useWorkerStore((state) => state.getActiveWorkers)

  return useMemo(() => {
    // Use groupByCount utility for cleaner grouping
    const documentsByStatus = groupByCount(documents, (doc) => doc.estado)
    const documentsByType = groupByCount(documents, (doc) => doc.tipo)
    const documentsByCompany = groupByCount(documents, (doc) => doc.empresaId)

    // Calculate approval rate
    const approvedCount = documentsByStatus['aprobado'] || 0
    const rejectedCount = documentsByStatus['rechazado'] || 0
    const totalReviewed = approvedCount + rejectedCount
    const approvalRate = totalReviewed > 0 ? (approvedCount / totalReviewed) * 100 : 0

    return {
      totalDocuments: documents.length,
      documentsByStatus,
      documentsByType,
      documentsByCompany,
      activeCompanies: getActiveCompanies().length,
      totalCompanies: companies.length,
      activeWorkers: getActiveWorkers().length,
      totalWorkers: workers.length,
      expiringDocuments: getExpiringDocuments(30).length,
      expiredDocuments: getExpiredDocuments().length,
      approvalRate: Math.round(approvalRate),
    }
  }, [documents, companies, workers, getActiveCompanies, getActiveWorkers, getExpiringDocuments, getExpiredDocuments])
}

// Helper to get status distribution for charts
export function useStatusDistribution() {
  const documents = useDocumentStore((state) => state.documents)

  return useMemo(() => {
    const distribution = groupByCount(documents, (doc) => doc.estado)

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: documents.length > 0 ? Math.round((count / documents.length) * 100) : 0,
    }))
  }, [documents])
}

// Helper to get type distribution for charts
export function useTypeDistribution() {
  const documents = useDocumentStore((state) => state.documents)

  return useMemo(() => {
    const distribution = groupByCount(documents, (doc) => doc.tipo)

    return Object.entries(distribution).map(([tipo, count]) => ({
      tipo,
      count,
      percentage: documents.length > 0 ? Math.round((count / documents.length) * 100) : 0,
    }))
  }, [documents])
}

// Helper to get monthly trend data
export function useMonthlyTrend(months: number = 6) {
  const documents = useDocumentStore((state) => state.documents)

  return useMemo(() => {
    const now = new Date()
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const result = []
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`

      const count = documents.filter((doc) => {
        const docDate = new Date(doc.fechaCreacion)
        return (
          docDate.getFullYear() === date.getFullYear() &&
          docDate.getMonth() === date.getMonth()
        )
      }).length

      result.push({ month: monthLabel, monthKey, count })
    }

    return result
  }, [documents, months])
}

// Helper to get company distribution with names
export function useCompanyDistribution() {
  const documents = useDocumentStore((state) => state.documents)
  const getCompanyById = useCompanyStore((state) => state.getCompanyById)

  return useMemo(() => {
    const distribution = groupByCount(documents, (doc) => doc.empresaId)

    return Object.entries(distribution)
      .map(([empresaId, count]) => {
        const company = getCompanyById(empresaId)
        return {
          id: empresaId,
          name: company?.razonSocial || company?.nombreComercial || 'Empresa Desconocida',
          count,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [documents, getCompanyById])
}

// Helper to get KPIs
export function useKPIs() {
  const documents = useDocumentStore((state) => state.documents)
  const getExpiringDocuments = useDocumentStore((state) => state.getExpiringDocuments)
  const getExpiredDocuments = useDocumentStore((state) => state.getExpiredDocuments)

  return useMemo(() => {
    const statusCounts = groupByCount(documents, (doc) => doc.estado)
    const approvedCount = statusCounts['aprobado'] || 0
    const rejectedCount = statusCounts['rechazado'] || 0
    const totalReviewed = approvedCount + rejectedCount
    const approvalRate = totalReviewed > 0 ? Math.round((approvedCount / totalReviewed) * 100) : 0

    const pendingCount = (statusCounts['pendiente_revision'] || 0) + (statusCounts['en_revision'] || 0)

    return {
      approvalRate,
      approvedCount,
      rejectedCount,
      pendingCount,
      totalDocuments: documents.length,
      expiringCount: getExpiringDocuments(30).length,
      expiredCount: getExpiredDocuments().length,
    }
  }, [documents, getExpiringDocuments, getExpiredDocuments])
}
