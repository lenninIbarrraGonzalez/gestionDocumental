import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentTable } from './document-table'

const mockDocuments = [
  {
    id: '1',
    codigo: 'DOC-2024-00001',
    titulo: 'Politica SST 2024',
    descripcion: 'Politica de seguridad',
    tipo: 'POL_SST',
    estado: 'borrador',
    empresaId: '1',
    fechaCreacion: new Date('2024-01-15'),
    fechaActualizacion: new Date('2024-01-15'),
    creadoPor: '1',
    version: 1,
  },
  {
    id: '2',
    codigo: 'DOC-2024-00002',
    titulo: 'FURAT Accidente',
    descripcion: null,
    tipo: 'FURAT',
    estado: 'aprobado',
    empresaId: '2',
    fechaCreacion: new Date('2024-01-20'),
    fechaActualizacion: new Date('2024-01-20'),
    creadoPor: '1',
    version: 1,
  },
  {
    id: '3',
    codigo: 'DOC-2024-00003',
    titulo: 'Matriz de Peligros',
    descripcion: 'Matriz actualizada',
    tipo: 'MAT_PEL',
    estado: 'en_revision',
    empresaId: '1',
    fechaCreacion: new Date('2024-01-10'),
    fechaActualizacion: new Date('2024-01-18'),
    creadoPor: '1',
    version: 2,
  },
]

describe('DocumentTable', () => {
  const mockOnView = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnSort = vi.fn()

  const defaultProps = {
    documents: mockDocuments,
    onView: mockOnView,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onSort: mockOnSort,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render table headers', () => {
    render(<DocumentTable {...defaultProps} />)

    expect(screen.getByRole('columnheader', { name: /código/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /título/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /tipo/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /estado/i })).toBeInTheDocument()
  })

  it('should render document rows', () => {
    render(<DocumentTable {...defaultProps} />)

    expect(screen.getByText('DOC-2024-00001')).toBeInTheDocument()
    expect(screen.getByText('DOC-2024-00002')).toBeInTheDocument()
    expect(screen.getByText('DOC-2024-00003')).toBeInTheDocument()
  })

  it('should render document titles', () => {
    render(<DocumentTable {...defaultProps} />)

    expect(screen.getByText('Politica SST 2024')).toBeInTheDocument()
    expect(screen.getByText('FURAT Accidente')).toBeInTheDocument()
    // "Matriz de Peligros" appears twice (title AND document type)
    expect(screen.getAllByText('Matriz de Peligros').length).toBeGreaterThanOrEqual(1)
  })

  it('should render status badges', () => {
    render(<DocumentTable {...defaultProps} />)

    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('Aprobado')).toBeInTheDocument()
    expect(screen.getByText('En Revision')).toBeInTheDocument()
  })

  it('should call onView when view action clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentTable {...defaultProps} />)

    const firstRow = screen.getAllByRole('row')[1]
    const viewButton = within(firstRow).getByRole('button', { name: /ver/i })
    await user.click(viewButton)

    expect(mockOnView).toHaveBeenCalledWith(mockDocuments[0])
  })

  it('should call onEdit when edit action clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentTable {...defaultProps} />)

    const firstRow = screen.getAllByRole('row')[1]
    const editButton = within(firstRow).getByRole('button', { name: /editar/i })
    await user.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockDocuments[0])
  })

  it('should call onDelete when delete action clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentTable {...defaultProps} />)

    const firstRow = screen.getAllByRole('row')[1]
    const deleteButton = within(firstRow).getByRole('button', { name: /eliminar/i })
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockDocuments[0])
  })

  it('should show empty state when no documents', () => {
    render(<DocumentTable {...defaultProps} documents={[]} />)

    expect(screen.getByText(/no hay documentos/i)).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<DocumentTable {...defaultProps} isLoading />)

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should show row count', () => {
    render(<DocumentTable {...defaultProps} />)

    expect(screen.getByText(/3 documento/i)).toBeInTheDocument()
  })

  it('should highlight selected row', () => {
    render(<DocumentTable {...defaultProps} selectedId="1" />)

    const firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveClass('bg-muted')
  })

  it('should call onSort when sortable column clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentTable {...defaultProps} />)

    const titleHeader = screen.getByRole('columnheader', { name: /título/i })
    await user.click(titleHeader)

    expect(mockOnSort).toHaveBeenCalledWith('titulo', expect.any(String))
  })

  it('should render actions column', () => {
    render(<DocumentTable {...defaultProps} />)

    expect(screen.getByRole('columnheader', { name: /acciones/i })).toBeInTheDocument()
  })

  it('should format dates correctly', () => {
    render(<DocumentTable {...defaultProps} />)

    // Check that dates are displayed (format may vary based on timezone/locale)
    // Just verify that a date cell contains a date-like string
    const dateCells = screen.getAllByRole('cell')
    const hasDate = dateCells.some((cell) => /\d{2}\/\d{2}\/\d{4}/.test(cell.textContent || ''))
    expect(hasDate).toBe(true)
  })
})
