import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentForm } from './document-form'

// Mock company store
vi.mock('@/stores/company-store', () => ({
  useCompanyStore: () => ({
    companies: [
      { id: '1', razonSocial: 'Empresa A S.A.S.', nombreComercial: 'Empresa A', nit: '900123456-1' },
      { id: '2', razonSocial: 'Empresa B Ltda', nombreComercial: 'Empresa B', nit: '900654321-2' },
    ],
  }),
}))

describe('DocumentForm', () => {
  const mockOnSubmit = vi.fn()
  const defaultProps = {
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields', () => {
    render(<DocumentForm {...defaultProps} />)

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<DocumentForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('should render cancel button', () => {
    render(<DocumentForm {...defaultProps} onCancel={vi.fn()} />)

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('should show validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<DocumentForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /guardar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for title too long', async () => {
    const user = userEvent.setup()
    render(<DocumentForm {...defaultProps} />)

    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'A'.repeat(201))

    const submitButton = screen.getByRole('button', { name: /guardar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/no puede exceder 200/i)).toBeInTheDocument()
    })
  })

  it('should call onSubmit with valid data', async () => {
    const user = userEvent.setup()
    // Use initialData to pre-fill required select fields
    const initialData = {
      titulo: '',
      tipo: 'POL_SST',
      empresaId: '1',
    }
    render(<DocumentForm {...defaultProps} initialData={initialData} />)

    // Fill title
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Test Document')

    // Submit
    const submitButton = screen.getByRole('button', { name: /guardar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
      const callArgs = mockOnSubmit.mock.calls[0][0]
      expect(callArgs).toMatchObject({
        titulo: 'Test Document',
        tipo: 'POL_SST',
        empresaId: '1',
      })
    })
  })

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const mockOnCancel = vi.fn()
    render(<DocumentForm {...defaultProps} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should populate form with initial data when editing', () => {
    const initialData = {
      titulo: 'Existing Document',
      descripcion: 'Description',
      tipo: 'FURAT',
      empresaId: '1',
    }

    render(<DocumentForm {...defaultProps} initialData={initialData} />)

    expect(screen.getByDisplayValue('Existing Document')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Description')).toBeInTheDocument()
  })

  it('should show loading state when submitting', () => {
    render(<DocumentForm {...defaultProps} isSubmitting />)

    const submitButton = screen.getByRole('button', { name: /guardando/i })
    expect(submitButton).toBeDisabled()
  })

  it('should render optional description field', () => {
    render(<DocumentForm {...defaultProps} />)

    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
  })

  it('should render optional date field', () => {
    render(<DocumentForm {...defaultProps} />)

    expect(screen.getByLabelText(/fecha de vigencia/i)).toBeInTheDocument()
  })
})
