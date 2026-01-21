import { create } from 'zustand'
import { db, type Company } from '@/lib/db'

interface CompanyState {
  companies: Company[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchCompanies: () => Promise<void>
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  isLoading: false,
  error: null,

  fetchCompanies: async () => {
    set({ isLoading: true, error: null })
    try {
      const companies = await db.companies.toArray()
      set({ companies, isLoading: false })
    } catch (error) {
      set({ error: 'Error al cargar empresas', isLoading: false })
    }
  },
}))
