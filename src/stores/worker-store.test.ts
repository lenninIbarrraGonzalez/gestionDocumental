import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useWorkerStore } from './worker-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    workers: {
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

describe('WorkerStore', () => {
  beforeEach(() => {
    // Reset store
    useWorkerStore.setState({
      workers: [],
      selectedWorker: null,
      isLoading: false,
      error: null,
      filter: {},
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useWorkerStore.getState()

      expect(state.workers).toEqual([])
      expect(state.selectedWorker).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('filter operations', () => {
    it('should set filter', () => {
      const { setFilter } = useWorkerStore.getState()

      act(() => {
        setFilter({ empresaId: '1', activo: true })
      })

      const state = useWorkerStore.getState()
      expect(state.filter.empresaId).toBe('1')
      expect(state.filter.activo).toBe(true)
    })

    it('should clear filter', () => {
      useWorkerStore.setState({
        filter: { empresaId: '1', activo: true },
      })

      const { clearFilter } = useWorkerStore.getState()

      act(() => {
        clearFilter()
      })

      expect(useWorkerStore.getState().filter).toEqual({})
    })
  })

  describe('selection', () => {
    it('should select worker', () => {
      const mockWorker = {
        id: '1',
        tipoDocumento: 'CC',
        documento: '12345678',
        nombres: 'Juan',
        apellidos: 'Perez',
        cargo: 'Operario',
        empresaId: '1',
        fechaIngreso: new Date(),
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      }

      const { selectWorker } = useWorkerStore.getState()

      act(() => {
        selectWorker(mockWorker as any)
      })

      expect(useWorkerStore.getState().selectedWorker).toEqual(mockWorker)
    })
  })

  describe('getFilteredWorkers', () => {
    const mockWorkers = [
      {
        id: '1',
        documento: '12345678',
        nombres: 'Juan',
        apellidos: 'Perez',
        empresaId: '1',
        activo: true,
        cargo: 'Operario',
      },
      {
        id: '2',
        documento: '87654321',
        nombres: 'Maria',
        apellidos: 'Garcia',
        empresaId: '2',
        activo: false,
        cargo: 'Supervisor',
      },
      {
        id: '3',
        documento: '11112222',
        nombres: 'Pedro',
        apellidos: 'Lopez',
        empresaId: '1',
        activo: true,
        cargo: 'Tecnico',
      },
    ]

    beforeEach(() => {
      useWorkerStore.setState({ workers: mockWorkers as any })
    })

    it('should filter by empresaId', () => {
      useWorkerStore.setState({ filter: { empresaId: '1' } })

      const filtered = useWorkerStore.getState().getFilteredWorkers()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((w) => w.empresaId === '1')).toBe(true)
    })

    it('should filter by activo status', () => {
      useWorkerStore.setState({ filter: { activo: true } })

      const filtered = useWorkerStore.getState().getFilteredWorkers()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((w) => w.activo === true)).toBe(true)
    })

    it('should filter by search term in nombres', () => {
      useWorkerStore.setState({ filter: { search: 'juan' } })

      const filtered = useWorkerStore.getState().getFilteredWorkers()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].nombres).toBe('Juan')
    })

    it('should filter by search term in documento', () => {
      useWorkerStore.setState({ filter: { search: '87654' } })

      const filtered = useWorkerStore.getState().getFilteredWorkers()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].documento).toBe('87654321')
    })
  })

  describe('getWorkersByCompany', () => {
    it('should return workers for specific company', () => {
      const mockWorkers = [
        { id: '1', empresaId: '1' },
        { id: '2', empresaId: '2' },
        { id: '3', empresaId: '1' },
      ]

      useWorkerStore.setState({ workers: mockWorkers as any })

      const companyWorkers = useWorkerStore.getState().getWorkersByCompany('1')

      expect(companyWorkers).toHaveLength(2)
      expect(companyWorkers.every((w) => w.empresaId === '1')).toBe(true)
    })
  })

  describe('getWorkerById', () => {
    it('should return worker by id', () => {
      const mockWorkers = [
        { id: '1', nombres: 'Worker 1' },
        { id: '2', nombres: 'Worker 2' },
      ]

      useWorkerStore.setState({ workers: mockWorkers as any })

      const worker = useWorkerStore.getState().getWorkerById('2')

      expect(worker?.nombres).toBe('Worker 2')
    })
  })
})
