import { create } from 'zustand'
import { db, type Company } from '@/lib/db'
import { generateId } from '@/lib/generators'

interface CompanyFilter {
  activa?: boolean
  ciudad?: string
  search?: string
}

interface CompanyState {
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean
  error: string | null
  filter: CompanyFilter

  // Actions
  fetchCompanies: () => Promise<void>
  createCompany: (data: Omit<Company, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => Promise<Company>
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
  setFilter: (filter: Partial<CompanyFilter>) => void
  clearFilter: () => void
  selectCompany: (company: Company | null) => void

  // Computed
  getFilteredCompanies: () => Company[]
  getActiveCompanies: () => Company[]
  getCompanyById: (id: string) => Company | undefined
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  selectedCompany: null,
  isLoading: false,
  error: null,
  filter: {},

  fetchCompanies: async () => {
    set({ isLoading: true, error: null })
    try {
      const companies = await db.companies.toArray()
      set({ companies, isLoading: false })
    } catch (error) {
      set({ error: 'Error al cargar empresas', isLoading: false })
    }
  },

  createCompany: async (data) => {
    const newCompany: Company = {
      ...data,
      id: generateId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    await db.companies.add(newCompany)
    set((state) => ({ companies: [...state.companies, newCompany] }))

    return newCompany
  },

  updateCompany: async (id: string, data: Partial<Company>) => {
    const company = await db.companies.get(id)
    if (!company) throw new Error('Empresa no encontrada')

    const updatedCompany = {
      ...company,
      ...data,
      fechaActualizacion: new Date(),
    }

    await db.companies.update(id, updatedCompany)
    set((state) => ({
      companies: state.companies.map((c) => (c.id === id ? updatedCompany : c)),
    }))
  },

  deleteCompany: async (id: string) => {
    await db.companies.delete(id)
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
      selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany,
    }))
  },

  toggleActive: async (id: string) => {
    const company = get().companies.find((c) => c.id === id)
    if (!company) throw new Error('Empresa no encontrada')

    await get().updateCompany(id, { activa: !company.activa })
  },

  setFilter: (filter: Partial<CompanyFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }))
  },

  clearFilter: () => {
    set({ filter: {} })
  },

  selectCompany: (company: Company | null) => {
    set({ selectedCompany: company })
  },

  getFilteredCompanies: () => {
    const { companies, filter } = get()

    let filtered = [...companies]

    if (filter.activa !== undefined) {
      filtered = filtered.filter((c) => c.activa === filter.activa)
    }

    if (filter.ciudad) {
      filtered = filtered.filter((c) => c.ciudad === filter.ciudad)
    }

    if (filter.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.razonSocial.toLowerCase().includes(search) ||
          c.nombreComercial?.toLowerCase().includes(search) ||
          c.nit.includes(search)
      )
    }

    return filtered
  },

  getActiveCompanies: () => {
    return get().companies.filter((c) => c.activa)
  },

  getCompanyById: (id: string) => {
    return get().companies.find((c) => c.id === id)
  },
}))
