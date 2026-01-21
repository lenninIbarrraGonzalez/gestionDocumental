import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentUpload } from './document-upload'

describe('DocumentUpload', () => {
  const mockOnUpload = vi.fn()
  const defaultProps = {
    onUpload: mockOnUpload,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render upload area', () => {
    render(<DocumentUpload {...defaultProps} />)

    expect(screen.getByText(/arrastra y suelta/i)).toBeInTheDocument()
  })

  it('should render accepted file types info', () => {
    render(<DocumentUpload {...defaultProps} />)

    expect(screen.getByText(/PDF, PNG, JPG/i)).toBeInTheDocument()
  })

  it('should render file size limit info', () => {
    render(<DocumentUpload {...defaultProps} />)

    expect(screen.getByText(/10MB/i)).toBeInTheDocument()
  })

  it('should have a browse button', () => {
    render(<DocumentUpload {...defaultProps} />)

    expect(screen.getByRole('button', { name: /seleccionar/i })).toBeInTheDocument()
  })

  it('should accept valid PDF file', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload {...defaultProps} />)

    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')

    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  it('should accept valid PNG file', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload {...defaultProps} />)

    const file = new File(['content'], 'image.png', { type: 'image/png' })
    const input = screen.getByTestId('file-input')

    await user.upload(input, file)

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  it('should reject invalid file type', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload {...defaultProps} />)

    // Use a file with valid extension but invalid MIME type to test JS validation
    // (bypasses browser accept attribute filtering)
    const file = new File(['content'], 'document.pdf', { type: 'application/msword' })
    const input = screen.getByTestId('file-input')

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/tipo de archivo no permitido/i)).toBeInTheDocument()
    })
    expect(mockOnUpload).not.toHaveBeenCalled()
  })

  it('should reject file larger than 10MB', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload {...defaultProps} />)

    const largeContent = new Array(11 * 1024 * 1024).fill('a').join('')
    const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/excede.*10MB/i)).toBeInTheDocument()
    })
    expect(mockOnUpload).not.toHaveBeenCalled()
  })

  it('should show loading state when uploading', async () => {
    render(<DocumentUpload {...defaultProps} isUploading />)

    expect(screen.getByText(/subiendo/i)).toBeInTheDocument()
  })

  it('should be disabled when uploading', () => {
    render(<DocumentUpload {...defaultProps} isUploading />)

    const button = screen.getByRole('button', { name: /subiendo/i })
    expect(button).toBeDisabled()
  })

  it('should highlight on drag over', async () => {
    render(<DocumentUpload {...defaultProps} />)

    const dropzone = screen.getByTestId('dropzone')

    fireEvent.dragEnter(dropzone)

    expect(dropzone).toHaveClass('border-primary')
  })
})
