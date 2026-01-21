'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Loader2, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateFile } from '@/lib/validations/document'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  onUpload: (file: File) => void
  isUploading?: boolean
  className?: string
}

export function DocumentUpload({
  onUpload,
  isUploading = false,
  className,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)

      const validation = validateFile(file)

      if (!validation.success) {
        const errorMessage = validation.error.issues[0]?.message || 'Archivo inválido'
        setError(errorMessage)
        return
      }

      onUpload(file)
    },
    [onUpload]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className={className}>
      <div
        data-testid="dropzone"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          data-testid="file-input"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Arrastra y suelta tu archivo aquí o
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Seleccionar archivo'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1 justify-center">
              <FileIcon className="h-3 w-3" />
              Formatos: PDF, PNG, JPG
            </p>
            <p>Tamaño máximo: 10MB</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
