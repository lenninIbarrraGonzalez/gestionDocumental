import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentViewer } from './document-viewer'

describe('DocumentViewer', () => {
  const mockOnClose = vi.fn()

  const defaultProps = {
    fileUrl: 'blob:http://localhost:3000/test-file',
    fileName: 'documento.pdf',
    fileType: 'application/pdf',
    onClose: mockOnClose,
  }

  it('should render file name', () => {
    render(<DocumentViewer {...defaultProps} />)

    expect(screen.getByText('documento.pdf')).toBeInTheDocument()
  })

  it('should render close button', () => {
    render(<DocumentViewer {...defaultProps} />)

    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentViewer {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should render PDF iframe for PDF files', () => {
    render(<DocumentViewer {...defaultProps} />)

    const iframe = screen.getByTestId('pdf-viewer')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', defaultProps.fileUrl)
  })

  it('should render image for image files', () => {
    render(
      <DocumentViewer
        {...defaultProps}
        fileType="image/png"
        fileName="imagen.png"
      />
    )

    const img = screen.getByRole('img', { name: /imagen/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', defaultProps.fileUrl)
  })

  it('should render download button', () => {
    render(<DocumentViewer {...defaultProps} />)

    expect(screen.getByRole('link', { name: /descargar/i })).toBeInTheDocument()
  })
})
