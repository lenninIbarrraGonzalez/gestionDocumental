'use client'

import { X, Download, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentViewerProps {
  fileUrl: string
  fileName: string
  fileType: string
  onClose: () => void
}

export function DocumentViewer({
  fileUrl,
  fileName,
  fileType,
  onClose,
}: DocumentViewerProps) {
  const isImage = fileType.startsWith('image/')
  const isPdf = fileType === 'application/pdf'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {isPdf ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={fileUrl} download={fileName} aria-label="Descargar archivo">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar visor"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/50 p-4">
        {isPdf && (
          <iframe
            data-testid="pdf-viewer"
            src={fileUrl}
            className="w-full h-full min-h-[600px] rounded-lg border bg-white"
            title={`Visor de ${fileName}`}
          />
        )}
        {isImage && (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={`Imagen: ${fileName}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
        {!isPdf && !isImage && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText className="h-16 w-16 mb-4" />
            <p>Vista previa no disponible para este tipo de archivo</p>
            <p className="text-sm mt-2">Use el boton de descarga para ver el archivo</p>
          </div>
        )}
      </div>
    </div>
  )
}
