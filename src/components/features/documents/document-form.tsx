'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { documentSchema, type DocumentFormData } from '@/lib/validations/document'
import { DOCUMENT_TYPES } from '@/lib/constants'
import { useCompanyStore } from '@/stores/company-store'

interface DocumentFormProps {
  onSubmit: (data: DocumentFormData) => void
  onCancel?: () => void
  initialData?: Partial<DocumentFormData>
  isSubmitting?: boolean
}

export function DocumentForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}: DocumentFormProps) {
  const { companies } = useCompanyStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      titulo: initialData?.titulo || '',
      descripcion: initialData?.descripcion || '',
      tipo: initialData?.tipo || '',
      empresaId: initialData?.empresaId || '',
      trabajadorId: initialData?.trabajadorId || '',
      fechaVigencia: initialData?.fechaVigencia,
    },
  })

  const tipo = watch('tipo')
  const empresaId = watch('empresaId')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            placeholder="Ingrese el título del documento"
            {...register('titulo')}
            aria-invalid={!!errors.titulo}
          />
          {errors.titulo && (
            <p className="text-sm text-destructive">{errors.titulo.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            placeholder="Descripción opcional del documento"
            rows={3}
            {...register('descripcion')}
            aria-invalid={!!errors.descripcion}
          />
          {errors.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion.message}</p>
          )}
        </div>

        {/* Document Type */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de documento *</Label>
          <Select
            value={tipo}
            onValueChange={(value) => setValue('tipo', value)}
          >
            <SelectTrigger id="tipo" data-testid="tipo-select">
              <SelectValue placeholder="Seleccione el tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa *</Label>
          <Select
            value={empresaId}
            onValueChange={(value) => setValue('empresaId', value)}
          >
            <SelectTrigger id="empresa" data-testid="empresa-select">
              <SelectValue placeholder="Seleccione la empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.nombreComercial || company.razonSocial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.empresaId && (
            <p className="text-sm text-destructive">{errors.empresaId.message}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div className="space-y-2">
          <Label htmlFor="fechaVigencia">Fecha de vigencia</Label>
          <Input
            id="fechaVigencia"
            type="date"
            {...register('fechaVigencia', {
              setValueAs: (value) => (value ? new Date(value) : undefined),
            })}
          />
          {errors.fechaVigencia && (
            <p className="text-sm text-destructive">
              {errors.fechaVigencia.message}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar documento'
          )}
        </Button>
      </div>
    </form>
  )
}
