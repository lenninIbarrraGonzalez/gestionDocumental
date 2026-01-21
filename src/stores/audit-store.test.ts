import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuditStore } from './audit-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    auditLogs: {
      toArray: vi.fn().mockResolvedValue([]),
      add: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
      orderBy: vi.fn().mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

describe('AuditStore', () => {
  beforeEach(() => {
    useAuditStore.setState({
      logs: [],
      isLoading: false,
      error: null,
      filter: {},
      currentPage: 1,
      pageSize: 25,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuditStore.getState()

      expect(state.logs).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.currentPage).toBe(1)
      expect(state.pageSize).toBe(25)
    })
  })

  describe('filter operations', () => {
    it('should set filter', () => {
      const { setFilter } = useAuditStore.getState()

      act(() => {
        setFilter({ accion: 'CREATE', entidad: 'documents' })
      })

      const state = useAuditStore.getState()
      expect(state.filter.accion).toBe('CREATE')
      expect(state.filter.entidad).toBe('documents')
    })

    it('should clear filter', () => {
      useAuditStore.setState({
        filter: { accion: 'CREATE', entidad: 'documents' },
      })

      const { clearFilter } = useAuditStore.getState()

      act(() => {
        clearFilter()
      })

      expect(useAuditStore.getState().filter).toEqual({})
    })

    it('should reset page when setting filter', () => {
      useAuditStore.setState({ currentPage: 5 })

      const { setFilter } = useAuditStore.getState()

      act(() => {
        setFilter({ accion: 'UPDATE' })
      })

      expect(useAuditStore.getState().currentPage).toBe(1)
    })
  })

  describe('pagination', () => {
    it('should set page', () => {
      const { setPage } = useAuditStore.getState()

      act(() => {
        setPage(3)
      })

      expect(useAuditStore.getState().currentPage).toBe(3)
    })

    it('should set page size and reset to page 1', () => {
      useAuditStore.setState({ currentPage: 5 })

      const { setPageSize } = useAuditStore.getState()

      act(() => {
        setPageSize(50)
      })

      const state = useAuditStore.getState()
      expect(state.pageSize).toBe(50)
      expect(state.currentPage).toBe(1)
    })
  })

  describe('getFilteredLogs', () => {
    const mockLogs = [
      {
        id: '1',
        entidad: 'documents',
        entidadId: 'doc1',
        accion: 'CREATE',
        usuarioId: 'user1',
        usuarioEmail: 'user1@test.com',
        timestamp: new Date('2024-01-15'),
      },
      {
        id: '2',
        entidad: 'companies',
        entidadId: 'comp1',
        accion: 'UPDATE',
        usuarioId: 'user2',
        usuarioEmail: 'user2@test.com',
        timestamp: new Date('2024-01-16'),
      },
      {
        id: '3',
        entidad: 'documents',
        entidadId: 'doc2',
        accion: 'DELETE',
        usuarioId: 'user1',
        usuarioEmail: 'user1@test.com',
        timestamp: new Date('2024-01-17'),
      },
    ]

    beforeEach(() => {
      useAuditStore.setState({ logs: mockLogs as any })
    })

    it('should filter by accion', () => {
      useAuditStore.setState({ filter: { accion: 'CREATE' } })

      const filtered = useAuditStore.getState().getFilteredLogs()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].accion).toBe('CREATE')
    })

    it('should filter by entidad', () => {
      useAuditStore.setState({ filter: { entidad: 'documents' } })

      const filtered = useAuditStore.getState().getFilteredLogs()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((l) => l.entidad === 'documents')).toBe(true)
    })

    it('should filter by usuarioId', () => {
      useAuditStore.setState({ filter: { usuarioId: 'user1' } })

      const filtered = useAuditStore.getState().getFilteredLogs()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((l) => l.usuarioId === 'user1')).toBe(true)
    })

    it('should filter by date range', () => {
      useAuditStore.setState({
        filter: {
          fechaDesde: new Date('2024-01-16'),
          fechaHasta: new Date('2024-01-17'),
        },
      })

      const filtered = useAuditStore.getState().getFilteredLogs()

      expect(filtered).toHaveLength(2)
    })
  })

  describe('getPaginatedLogs', () => {
    it('should return correct page of logs', () => {
      const mockLogs = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        entidad: 'documents',
        accion: 'VIEW',
        timestamp: new Date(),
      }))

      useAuditStore.setState({
        logs: mockLogs as any,
        currentPage: 2,
        pageSize: 25,
      })

      const paginated = useAuditStore.getState().getPaginatedLogs()

      expect(paginated).toHaveLength(25)
    })
  })

  describe('getLogsByEntity', () => {
    it('should return logs for specific entity', () => {
      const mockLogs = [
        { id: '1', entidad: 'documents', entidadId: 'doc1' },
        { id: '2', entidad: 'documents', entidadId: 'doc2' },
        { id: '3', entidad: 'companies', entidadId: 'comp1' },
      ]

      useAuditStore.setState({ logs: mockLogs as any })

      const entityLogs = useAuditStore.getState().getLogsByEntity('documents', 'doc1')

      expect(entityLogs).toHaveLength(1)
      expect(entityLogs[0].entidadId).toBe('doc1')
    })
  })
})
