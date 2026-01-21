import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDashboardStats } from './use-dashboard-stats'

// Mock stores
vi.mock('@/stores/document-store', () => ({
  useDocumentStore: vi.fn(() => ({
    documents: [
      { id: '1', estado: 'borrador', tipo: 'POL_SST', empresaId: '1' },
      { id: '2', estado: 'aprobado', tipo: 'FURAT', empresaId: '1' },
      { id: '3', estado: 'en_revision', tipo: 'POL_SST', empresaId: '2' },
      { id: '4', estado: 'aprobado', tipo: 'MAT_PEL', empresaId: '1' },
      { id: '5', estado: 'rechazado', tipo: 'FURAT', empresaId: '2' },
    ],
    getExpiringDocuments: vi.fn(() => [{ id: '1' }, { id: '2' }]),
    getExpiredDocuments: vi.fn(() => [{ id: '3' }]),
  })),
}))

vi.mock('@/stores/company-store', () => ({
  useCompanyStore: vi.fn(() => ({
    companies: [
      { id: '1', activa: true },
      { id: '2', activa: true },
      { id: '3', activa: false },
    ],
    getActiveCompanies: vi.fn(() => [{ id: '1' }, { id: '2' }]),
  })),
}))

vi.mock('@/stores/worker-store', () => ({
  useWorkerStore: vi.fn(() => ({
    workers: [
      { id: '1', activo: true },
      { id: '2', activo: true },
      { id: '3', activo: false },
      { id: '4', activo: true },
    ],
    getActiveWorkers: vi.fn(() => [{ id: '1' }, { id: '2' }, { id: '4' }]),
  })),
}))

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return total documents count', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.totalDocuments).toBe(5)
  })

  it('should return documents by status', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.documentsByStatus.borrador).toBe(1)
    expect(result.current.documentsByStatus.aprobado).toBe(2)
    expect(result.current.documentsByStatus.en_revision).toBe(1)
    expect(result.current.documentsByStatus.rechazado).toBe(1)
  })

  it('should return documents by type', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.documentsByType.POL_SST).toBe(2)
    expect(result.current.documentsByType.FURAT).toBe(2)
    expect(result.current.documentsByType.MAT_PEL).toBe(1)
  })

  it('should return active companies count', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.activeCompanies).toBe(2)
  })

  it('should return active workers count', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.activeWorkers).toBe(3)
  })

  it('should return expiring documents count', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.expiringDocuments).toBe(2)
  })

  it('should return expired documents count', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.expiredDocuments).toBe(1)
  })
})
