import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from './auth-store'

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user on logout', () => {
      // Setup: logged in user
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'admin@arl.com',
          nombre: 'Admin',
          apellido: 'User',
          rol: 'admin',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        isAuthenticated: true,
      })

      const { logout } = useAuthStore.getState()

      act(() => {
        logout()
      })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error message', () => {
      useAuthStore.setState({ error: 'Some error' })

      const { clearError } = useAuthStore.getState()
      act(() => {
        clearError()
      })

      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('persistence', () => {
    it('should persist to localStorage when state changes', () => {
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'admin@arl.com',
          nombre: 'Admin',
          apellido: 'User',
          rol: 'admin',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        isAuthenticated: true,
      })

      const stored = localStorage.getItem('auth-storage')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.isAuthenticated).toBe(true)
    })

    it('should rehydrate from localStorage', () => {
      // Simulate stored session
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: {
              id: '1',
              email: 'admin@arl.com',
              nombre: 'Admin',
              apellido: 'User',
              rol: 'admin',
              activo: true,
            },
            isAuthenticated: true,
          },
          version: 0,
        })
      )

      // Rehydrate store
      useAuthStore.persist.rehydrate()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
    })
  })
})
