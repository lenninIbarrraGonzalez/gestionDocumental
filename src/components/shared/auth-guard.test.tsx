import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from './auth-guard'

// Mock next/navigation
const mockReplace = vi.fn()
let mockPathname = '/'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => mockPathname,
}))

// Mock auth store
let mockIsAuthenticated = false
let mockUser: { rol: string } | null = null

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      isAuthenticated: mockIsAuthenticated,
      user: mockUser,
    }
    return selector ? selector(state) : state
  }),
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsAuthenticated = false
    mockUser = null
    mockPathname = '/'
  })

  describe('unauthenticated user', () => {
    it('should redirect to login when accessing protected route', () => {
      mockIsAuthenticated = false
      mockPathname = '/dashboard'

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockReplace).toHaveBeenCalledWith('/login')
    })

    it('should allow access to login page', () => {
      mockIsAuthenticated = false
      mockPathname = '/login'

      render(
        <AuthGuard>
          <div>Login Page</div>
        </AuthGuard>
      )

      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('authenticated user', () => {
    it('should allow access to protected route', () => {
      mockIsAuthenticated = true
      mockUser = { rol: 'admin' }
      mockPathname = '/dashboard'

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockReplace).not.toHaveBeenCalled()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should redirect from login page to home', () => {
      mockIsAuthenticated = true
      mockUser = { rol: 'admin' }
      mockPathname = '/login'

      render(
        <AuthGuard>
          <div>Login Page</div>
        </AuthGuard>
      )

      expect(mockReplace).toHaveBeenCalledWith('/')
    })
  })

  describe('role restriction', () => {
    it('should allow access when user has required role', () => {
      mockIsAuthenticated = true
      mockUser = { rol: 'admin' }
      mockPathname = '/usuarios'

      render(
        <AuthGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </AuthGuard>
      )

      expect(mockReplace).not.toHaveBeenCalled()
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })

    it('should redirect when user lacks required role', () => {
      mockIsAuthenticated = true
      mockUser = { rol: 'consultor' }
      mockPathname = '/usuarios'

      render(
        <AuthGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </AuthGuard>
      )

      expect(mockReplace).toHaveBeenCalledWith('/')
    })
  })
})
