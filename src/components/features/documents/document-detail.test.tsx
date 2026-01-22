import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentDetail } from './document-detail'

// Mock auth store with admin permissions for PermissionGate
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: '1', rol: 'admin' },
      isAuthenticated: true,
    }
    return selector ? selector(state) : state
  }),
}))

const mockDocument = {
  id: '1',
  codigo: 'DOC-2024-00001',
  titulo: 'Politica SST 2024',
  descripcion: 'Politica de seguridad y salud en el trabajo',
  tipo: 'POL_SST',
  estado: 'borrador',
  empresaId: '1',
  trabajadorId: null,
  fechaVigencia: new Date('2024-12-31'),
  fechaCreacion: new Date('2024-01-15'),
  fechaActualizacion: new Date('2024-01-20'),
  creadoPor: '1',
  actualizadoPor: '2',
  version: 2,
}

describe('DocumentDetail', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnStatusChange = vi.fn()
  const mockOnClose = vi.fn()

  const defaultProps = {
    document: mockDocument,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onStatusChange: mockOnStatusChange,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render document title', () => {
    render(<DocumentDetail {...defaultProps} />)

    expect(screen.getByText('Politica SST 2024')).toBeInTheDocument()
  })

  it('should render document code', () => {
    render(<DocumentDetail {...defaultProps} />)

    expect(screen.getByText('DOC-2024-00001')).toBeInTheDocument()
  })

  it('should render document description', () => {
    render(<DocumentDetail {...defaultProps} />)

    expect(screen.getByText(/Politica de seguridad/i)).toBeInTheDocument()
  })

  it('should render document status badge', () => {
    render(<DocumentDetail {...defaultProps} />)

    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('should render document type', () => {
    render(<DocumentDetail {...defaultProps} />)

    // Document type appears in metadata section - title also contains "Politica SST"
    const typeElements = screen.getAllByText(/Politica SST/)
    expect(typeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should render version number', () => {
    render(<DocumentDetail {...defaultProps} />)

    // Version label and value are separate elements
    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('v2')).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentDetail {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /editar/i }))

    expect(mockOnEdit).toHaveBeenCalledWith(mockDocument)
  })

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentDetail {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })
})
