import { useMemo } from 'react'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useWorkerStore } from '@/stores/worker-store'
import type { DocumentStatus } from '@/types'

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
  const { documents, getExpiringDocuments, getExpiredDocuments } = useDocumentStore()
  const { companies, getActiveCompanies } = useCompanyStore()
  const { workers, getActiveWorkers } = useWorkerStore()

  return useMemo(() => {
    // Documents by status
    const documentsByStatus = documents.reduce(
      (acc, doc) => {
        acc[doc.estado] = (acc[doc.estado] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Documents by type
    const documentsByType = documents.reduce(
      (acc, doc) => {
        acc[doc.tipo] = (acc[doc.tipo] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Documents by company
    const documentsByCompany = documents.reduce(
      (acc, doc) => {
        acc[doc.empresaId] = (acc[doc.empresaId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

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
  const { documents } = useDocumentStore()

  return useMemo(() => {
    const distribution = documents.reduce(
      (acc, doc) => {
        acc[doc.estado] = (acc[doc.estado] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / documents.length) * 100),
    }))
  }, [documents])
}

// Helper to get type distribution for charts
export function useTypeDistribution() {
  const { documents } = useDocumentStore()

  return useMemo(() => {
    const distribution = documents.reduce(
      (acc, doc) => {
        acc[doc.tipo] = (acc[doc.tipo] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(distribution).map(([tipo, count]) => ({
      tipo,
      count,
      percentage: Math.round((count / documents.length) * 100),
    }))
  }, [documents])
}
