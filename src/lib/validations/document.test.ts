import { describe, it, expect } from 'vitest'
import {
  validateDocument,
  validateFile,
  documentSchema,
  fileValidationSchema,
} from './document'

describe('Document Validations', () => {
  describe('documentSchema', () => {
    it('should validate correct document data', () => {
      const validData = {
        titulo: 'Politica SST 2024',
        tipo: 'POL_SST',
        empresaId: '1',
      }

      const result = documentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty titulo', () => {
      const invalidData = {
        titulo: '',
        tipo: 'POL_SST',
        empresaId: '1',
      }

      const result = documentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject titulo shorter than 3 characters', () => {
      const invalidData = {
        titulo: 'AB',
        tipo: 'POL_SST',
        empresaId: '1',
      }

      const result = documentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject titulo longer than 200 characters', () => {
      const invalidData = {
        titulo: 'A'.repeat(201),
        tipo: 'POL_SST',
        empresaId: '1',
      }

      const result = documentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid document type', () => {
      const invalidData = {
        titulo: 'Test Document',
        tipo: 'INVALID_TYPE',
        empresaId: '1',
      }

      const result = documentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty empresaId', () => {
      const invalidData = {
        titulo: 'Test Document',
        tipo: 'POL_SST',
        empresaId: '',
      }

      const result = documentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should allow optional fields', () => {
      const validData = {
        titulo: 'Politica SST 2024',
        descripcion: 'Descripcion opcional',
        tipo: 'POL_SST',
        empresaId: '1',
        trabajadorId: '1',
        fechaVigencia: new Date(),
      }

      const result = documentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('fileValidationSchema', () => {
    it('should validate PDF file', () => {
      const validFile = {
        name: 'document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf',
      }

      const result = fileValidationSchema.safeParse(validFile)
      expect(result.success).toBe(true)
    })

    it('should validate PNG file', () => {
      const validFile = {
        name: 'image.png',
        size: 500 * 1024, // 500KB
        type: 'image/png',
      }

      const result = fileValidationSchema.safeParse(validFile)
      expect(result.success).toBe(true)
    })

    it('should reject file larger than 10MB', () => {
      const invalidFile = {
        name: 'large.pdf',
        size: 11 * 1024 * 1024, // 11MB
        type: 'application/pdf',
      }

      const result = fileValidationSchema.safeParse(invalidFile)
      expect(result.success).toBe(false)
    })

    it('should reject invalid file type', () => {
      const invalidFile = {
        name: 'document.doc',
        size: 1024 * 1024,
        type: 'application/msword',
      }

      const result = fileValidationSchema.safeParse(invalidFile)
      expect(result.success).toBe(false)
    })
  })

  describe('validateDocument', () => {
    it('should return success for valid data', () => {
      const result = validateDocument({
        titulo: 'Test Document',
        tipo: 'FURAT',
        empresaId: '1',
      })

      expect(result.success).toBe(true)
    })

    it('should return error for invalid data', () => {
      const result = validateDocument({
        titulo: '',
        tipo: 'INVALID',
        empresaId: '',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('validateFile', () => {
    it('should validate File object', () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const result = validateFile(file)
      expect(result.success).toBe(true)
    })
  })
})
