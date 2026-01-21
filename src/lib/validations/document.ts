import { z } from 'zod'
import { DOCUMENT_TYPES, FILE_LIMITS } from '@/lib/constants'

// Document type enum from constants
const documentTypeValues = Object.keys(DOCUMENT_TYPES) as [string, ...string[]]

// Base document schema
export const documentSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(200, 'El titulo no puede exceder 200 caracteres'),
  descripcion: z
    .string()
    .max(1000, 'La descripcion no puede exceder 1000 caracteres')
    .optional(),
  tipo: z.enum(documentTypeValues, {
    message: 'Tipo de documento requerido',
  }),
  empresaId: z.string().min(1, 'Empresa es requerida'),
  trabajadorId: z.string().optional(),
  fechaVigencia: z.date().optional(),
})

// Create document DTO
export const createDocumentSchema = documentSchema

// Update document DTO
export const updateDocumentSchema = documentSchema.partial().extend({
  observaciones: z.string().max(500).optional(),
})

// File validation schema
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'Nombre de archivo requerido'),
  size: z
    .number()
    .max(FILE_LIMITS.MAX_SIZE, 'El archivo no puede exceder 10MB'),
  type: z.enum([...FILE_LIMITS.ALLOWED_TYPES] as [string, ...string[]], {
    message: 'Tipo de archivo no permitido. Use PDF, PNG o JPG',
  }),
})

// Document filter schema
export const documentFilterSchema = z.object({
  estado: z.string().optional(),
  tipo: z.string().optional(),
  empresaId: z.string().optional(),
  fechaDesde: z.date().optional(),
  fechaHasta: z.date().optional(),
  search: z.string().optional(),
})

// Types
export type DocumentFormData = z.infer<typeof documentSchema>
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type FileValidation = z.infer<typeof fileValidationSchema>
export type DocumentFilterInput = z.infer<typeof documentFilterSchema>

// Validation functions
export function validateDocument(data: unknown) {
  return documentSchema.safeParse(data)
}

export function validateFile(file: File) {
  return fileValidationSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  })
}

export function validateDocumentFilter(data: unknown) {
  return documentFilterSchema.safeParse(data)
}
