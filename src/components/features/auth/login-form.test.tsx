import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}))

// Mock auth store state
let mockIsLoading = false
let mockError: string | null = null
const mockLogin = vi.fn()
const mockClearError = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        login: mockLogin,
        isLoading: mockIsLoading,
        error: mockError,
        clearError: mockClearError,
        isAuthenticated: false,
      }
      return selector ? selector(state) : state
    }),
    {
      getState: () => ({
        isAuthenticated: false,
      }),
    }
  ),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLoading = false
    mockError = null
  })

  describe('rendering', () => {
    it('should render email input', () => {
      render(<LoginForm />)
      expect(screen.getByPlaceholderText(/correo@ejemplo/i)).toBeInTheDocument()
    })

    it('should render password input', () => {
      render(<LoginForm />)
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginForm />)
      expect(
        screen.getByRole('button', { name: /iniciar sesion/i })
      ).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

      await waitFor(() => {
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument()
      })
    })

    it('should show error for empty password', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByPlaceholderText(/correo@ejemplo/i)
      await user.type(emailInput, 'test@test.com')
      await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/contraseña es requerida/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('password visibility', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const passwordInput = screen.getByPlaceholderText(/••••••••/i)
      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button', {
        name: /mostrar contraseña/i,
      })
      await user.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('submission', () => {
    it('should call login with credentials on valid submit', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      render(<LoginForm />)

      const emailInput = screen.getByPlaceholderText(/correo@ejemplo/i)
      const passwordInput = screen.getByPlaceholderText(/••••••••/i)

      await user.type(emailInput, 'admin@arl.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@arl.com', 'password123')
      })
    })
  })

  describe('error handling', () => {
    it('should display error message from store', () => {
      mockError = 'Credenciales invalidas'
      render(<LoginForm />)

      expect(screen.getByText(/credenciales invalidas/i)).toBeInTheDocument()
    })
  })
})
