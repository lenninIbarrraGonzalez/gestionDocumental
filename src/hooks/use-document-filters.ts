import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDocumentStore } from '@/stores/document-store'
import type { Document } from '@/lib/db'
import type { DocumentStatus } from '@/types'

export type VigenciaFilter = 'all' | 'vencido' | 'proxima'

interface UseDocumentFiltersReturn {
  // State
  search: string
  vigenciaFilter: VigenciaFilter
  filteredDocs: Document[]

  // Actions
  handleSearchChange: (value: string) => void
  handleStatusChange: (value: string) => void
  handleTypeChange: (value: string) => void
  setVigenciaFilter: (value: VigenciaFilter) => void
  clearVigenciaFilter: () => void
}

/**
 * Hook for managing document filters including vigencia (expiration) filters
 */
export function useDocumentFilters(): UseDocumentFiltersReturn {
  const searchParams = useSearchParams()

  // Store selectors
  const setFilter = useDocumentStore((state) => state.setFilter)
  const getFilteredDocuments = useDocumentStore((state) => state.getFilteredDocuments)
  const getExpiredDocuments = useDocumentStore((state) => state.getExpiredDocuments)
  const getExpiringDocuments = useDocumentStore((state) => state.getExpiringDocuments)

  // Local state
  const [search, setSearch] = useState('')
  const [vigenciaFilter, setVigenciaFilterState] = useState<VigenciaFilter>('all')

  // Handle query params for vigencia filter
  useEffect(() => {
    const vigenciaParam = searchParams.get('vigencia')
    if (vigenciaParam === 'vencido' || vigenciaParam === 'proxima') {
      setVigenciaFilterState(vigenciaParam)
    } else {
      setVigenciaFilterState('all')
    }
  }, [searchParams])

  // Get filtered documents based on vigencia filter or regular filters
  const getDocumentsForDisplay = useCallback((): Document[] => {
    if (vigenciaFilter === 'vencido') {
      return getExpiredDocuments()
    } else if (vigenciaFilter === 'proxima') {
      return getExpiringDocuments(7)
    }
    return getFilteredDocuments()
  }, [vigenciaFilter, getExpiredDocuments, getExpiringDocuments, getFilteredDocuments])

  const filteredDocs = getDocumentsForDisplay()

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setFilter({ search: value })
  }, [setFilter])

  const handleStatusChange = useCallback((value: string) => {
    if (value === 'all') {
      setFilter({ estado: undefined })
    } else {
      setFilter({ estado: value as DocumentStatus })
    }
  }, [setFilter])

  const handleTypeChange = useCallback((value: string) => {
    if (value === 'all') {
      setFilter({ tipo: undefined })
    } else {
      setFilter({ tipo: value })
    }
  }, [setFilter])

  const setVigenciaFilter = useCallback((value: VigenciaFilter) => {
    setVigenciaFilterState(value)
  }, [])

  const clearVigenciaFilter = useCallback(() => {
    setVigenciaFilterState('all')
  }, [])

  return {
    search,
    vigenciaFilter,
    filteredDocs,
    handleSearchChange,
    handleStatusChange,
    handleTypeChange,
    setVigenciaFilter,
    clearVigenciaFilter,
  }
}
