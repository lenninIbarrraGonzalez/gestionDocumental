import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCompanyStore } from './company-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    companies: {
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
    },
  },
}))

describe('CompanyStore', () => {
  beforeEach(() => {
    // Reset store
    useCompanyStore.setState({
      companies: [],
      selectedCompany: null,
      isLoading: false,
      error: null,
      filter: {},
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useCompanyStore.getState()

      expect(state.companies).toEqual([])
      expect(state.selectedCompany).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('filter operations', () => {
    it('should set filter', () => {
      const { setFilter } = useCompanyStore.getState()

      act(() => {
        setFilter({ activa: true, search: 'test' })
      })

      const state = useCompanyStore.getState()
      expect(state.filter.activa).toBe(true)
      expect(state.filter.search).toBe('test')
    })

    it('should clear filter', () => {
      useCompanyStore.setState({
        filter: { activa: true, search: 'test' },
      })

      const { clearFilter } = useCompanyStore.getState()

      act(() => {
        clearFilter()
      })

      expect(useCompanyStore.getState().filter).toEqual({})
    })
  })

  describe('selection', () => {
    it('should select company', () => {
      const mockCompany = {
        id: '1',
        nit: '900123456',
        digitoVerificacion: '1',
        razonSocial: 'Test Company',
        direccion: 'Calle 123',
        ciudad: 'Bogota',
        departamento: 'Cundinamarca',
        telefono: '1234567',
        email: 'test@company.com',
        representanteLegal: 'John Doe',
        activa: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      }

      const { selectCompany } = useCompanyStore.getState()

      act(() => {
        selectCompany(mockCompany as any)
      })

      expect(useCompanyStore.getState().selectedCompany).toEqual(mockCompany)
    })

    it('should deselect company', () => {
      useCompanyStore.setState({
        selectedCompany: { id: '1' } as any,
      })

      const { selectCompany } = useCompanyStore.getState()

      act(() => {
        selectCompany(null)
      })

      expect(useCompanyStore.getState().selectedCompany).toBeNull()
    })
  })

  describe('getFilteredCompanies', () => {
    const mockCompanies = [
      {
        id: '1',
        nit: '900123456',
        razonSocial: 'Empresa Alpha',
        nombreComercial: 'Alpha',
        activa: true,
        ciudad: 'Bogota',
      },
      {
        id: '2',
        nit: '900654321',
        razonSocial: 'Empresa Beta',
        nombreComercial: 'Beta',
        activa: false,
        ciudad: 'Medellin',
      },
      {
        id: '3',
        nit: '900111222',
        razonSocial: 'Empresa Gamma',
        nombreComercial: 'Gamma',
        activa: true,
        ciudad: 'Bogota',
      },
    ]

    beforeEach(() => {
      useCompanyStore.setState({ companies: mockCompanies as any })
    })

    it('should filter by activa status', () => {
      useCompanyStore.setState({ filter: { activa: true } })

      const filtered = useCompanyStore.getState().getFilteredCompanies()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((c) => c.activa === true)).toBe(true)
    })

    it('should filter by search term in razonSocial', () => {
      useCompanyStore.setState({ filter: { search: 'alpha' } })

      const filtered = useCompanyStore.getState().getFilteredCompanies()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].razonSocial).toBe('Empresa Alpha')
    })

    it('should filter by search term in NIT', () => {
      useCompanyStore.setState({ filter: { search: '900654' } })

      const filtered = useCompanyStore.getState().getFilteredCompanies()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].nit).toBe('900654321')
    })

    it('should filter by ciudad', () => {
      useCompanyStore.setState({ filter: { ciudad: 'Bogota' } })

      const filtered = useCompanyStore.getState().getFilteredCompanies()

      expect(filtered).toHaveLength(2)
      expect(filtered.every((c) => c.ciudad === 'Bogota')).toBe(true)
    })
  })

  describe('getActiveCompanies', () => {
    it('should return only active companies', () => {
      const mockCompanies = [
        { id: '1', activa: true },
        { id: '2', activa: false },
        { id: '3', activa: true },
      ]

      useCompanyStore.setState({ companies: mockCompanies as any })

      const active = useCompanyStore.getState().getActiveCompanies()

      expect(active).toHaveLength(2)
      expect(active.every((c) => c.activa === true)).toBe(true)
    })
  })

  describe('getCompanyById', () => {
    it('should return company by id', () => {
      const mockCompanies = [
        { id: '1', razonSocial: 'Company 1' },
        { id: '2', razonSocial: 'Company 2' },
      ]

      useCompanyStore.setState({ companies: mockCompanies as any })

      const company = useCompanyStore.getState().getCompanyById('2')

      expect(company?.razonSocial).toBe('Company 2')
    })

    it('should return undefined for non-existent id', () => {
      useCompanyStore.setState({ companies: [] })

      const company = useCompanyStore.getState().getCompanyById('999')

      expect(company).toBeUndefined()
    })
  })
})
