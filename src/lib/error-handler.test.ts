import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createEntityErrorMessage,
  createNotFoundMessage,
  normalizeError,
  handleStoreError,
  isPermissionError,
  isNotFoundError,
  type AppError,
} from './error-handler'
import { PermissionError } from './store-permission-middleware'
import { MODULES, ACTIONS } from './permissions'

describe('error-handler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('createEntityErrorMessage', () => {
    it('should create correct message for fetch operation', () => {
      const message = createEntityErrorMessage('documento', 'fetch', true)
      expect(message).toBe('Error al cargar los documentos')
    })

    it('should create correct message for create operation', () => {
      const message = createEntityErrorMessage('empresa', 'create')
      expect(message).toBe('Error al crear la empresa')
    })

    it('should create correct message for update operation', () => {
      const message = createEntityErrorMessage('trabajador', 'update')
      expect(message).toBe('Error al actualizar el trabajador')
    })

    it('should create correct message for delete operation', () => {
      const message = createEntityErrorMessage('usuario', 'delete')
      expect(message).toBe('Error al eliminar el usuario')
    })

    it('should use plural form when isPlural is true', () => {
      const message = createEntityErrorMessage('documento', 'fetch', true)
      expect(message).toBe('Error al cargar los documentos')
    })

    it('should use singular form when isPlural is false', () => {
      const message = createEntityErrorMessage('documento', 'fetch', false)
      expect(message).toBe('Error al cargar el documento')
    })
  })

  describe('createNotFoundMessage', () => {
    it('should create correct not found message for documento', () => {
      const message = createNotFoundMessage('documento')
      expect(message).toBe('Documento no encontrado')
    })

    it('should create correct not found message for empresa', () => {
      const message = createNotFoundMessage('empresa')
      expect(message).toBe('Empresa no encontrado')
    })

    it('should create correct not found message for trabajador', () => {
      const message = createNotFoundMessage('trabajador')
      expect(message).toBe('Trabajador no encontrado')
    })

    it('should create correct not found message for usuario', () => {
      const message = createNotFoundMessage('usuario')
      expect(message).toBe('Usuario no encontrado')
    })
  })

  describe('normalizeError', () => {
    it('should handle PermissionError', () => {
      const permError = new PermissionError(MODULES.DOCUMENTS, ACTIONS.CREATE, 'consultor')

      const result = normalizeError(permError, 'Fallback message')

      expect(result.type).toBe('PERMISSION_DENIED')
      expect(result.message).toBe(permError.message)
      expect(result.userMessage).toBe(permError.message)
      expect(result.details).toEqual({
        module: MODULES.DOCUMENTS,
        action: ACTIONS.CREATE,
        userRole: 'consultor',
      })
    })

    it('should handle standard Error with "no encontrad" pattern', () => {
      const error = new Error('Documento no encontrado')

      const result = normalizeError(error, 'Fallback')

      expect(result.type).toBe('NOT_FOUND')
      expect(result.message).toBe('Documento no encontrado')
      expect(result.userMessage).toBe('Documento no encontrado')
    })

    it('should handle standard Error with permission-related message', () => {
      const error = new Error('No tiene permiso para realizar esta accion')

      const result = normalizeError(error, 'Fallback')

      expect(result.type).toBe('PERMISSION_DENIED')
    })

    it('should handle database constraint errors', () => {
      const error = new Error('Constraint violation')
      error.name = 'ConstraintError'

      const result = normalizeError(error, 'Fallback')

      expect(result.type).toBe('DATABASE_ERROR')
      expect(result.userMessage).toBe('Error al guardar los datos')
    })

    it('should handle unknown Error types', () => {
      const error = new Error('Some unknown error')

      const result = normalizeError(error, 'Fallback message')

      expect(result.type).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('Some unknown error')
      expect(result.userMessage).toBe('Fallback message')
    })

    it('should handle string errors', () => {
      const result = normalizeError('String error', 'Fallback message')

      expect(result.type).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('String error')
      expect(result.userMessage).toBe('Fallback message')
    })

    it('should handle non-standard error types', () => {
      const result = normalizeError({ code: 500 }, 'Fallback message')

      expect(result.type).toBe('UNKNOWN_ERROR')
      expect(result.userMessage).toBe('Fallback message')
    })
  })

  describe('handleStoreError', () => {
    it('should return AppError with correct user message', () => {
      const error = new Error('Database connection failed')

      const result = handleStoreError(error, 'documento', 'fetch', '[test]')

      expect(result.userMessage).toBe('Error al cargar los documentos')
    })

    it('should log error to console', () => {
      const error = new Error('Test error')

      handleStoreError(error, 'empresa', 'create', '[company-store]')

      expect(console.error).toHaveBeenCalledWith(
        '[company-store] - create:',
        expect.objectContaining({
          type: 'UNKNOWN_ERROR',
          message: 'Test error',
        })
      )
    })

    it('should handle PermissionError correctly', () => {
      const permError = new PermissionError(MODULES.COMPANIES, ACTIONS.DELETE, 'supervisor')

      const result = handleStoreError(permError, 'empresa', 'delete', '[company-store]')

      expect(result.type).toBe('PERMISSION_DENIED')
      expect(result.userMessage).toBe(permError.message)
    })
  })

  describe('isPermissionError', () => {
    it('should return true for PermissionError', () => {
      const error = new PermissionError(MODULES.DOCUMENTS, ACTIONS.CREATE)
      expect(isPermissionError(error)).toBe(true)
    })

    it('should return false for standard Error', () => {
      const error = new Error('Standard error')
      expect(isPermissionError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(isPermissionError('string')).toBe(false)
      expect(isPermissionError(null)).toBe(false)
      expect(isPermissionError(undefined)).toBe(false)
    })
  })

  describe('isNotFoundError', () => {
    it('should return true for NOT_FOUND error type', () => {
      const error: AppError = {
        type: 'NOT_FOUND',
        message: 'Not found',
        userMessage: 'Not found',
      }
      expect(isNotFoundError(error)).toBe(true)
    })

    it('should return false for other error types', () => {
      const error: AppError = {
        type: 'PERMISSION_DENIED',
        message: 'Permission denied',
        userMessage: 'Permission denied',
      }
      expect(isNotFoundError(error)).toBe(false)
    })
  })
})
