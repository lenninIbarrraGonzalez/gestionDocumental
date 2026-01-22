import { PermissionError } from './store-permission-middleware'

/**
 * Structured error types for the application
 */
export type ErrorType =
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Structured application error
 */
export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  details?: Record<string, unknown>
}

/**
 * Entity names for error messages
 */
export type EntityName = 'documento' | 'empresa' | 'trabajador' | 'usuario'

const ENTITY_LABELS: Record<EntityName, { singular: string; plural: string }> = {
  documento: { singular: 'el documento', plural: 'los documentos' },
  empresa: { singular: 'la empresa', plural: 'las empresas' },
  trabajador: { singular: 'el trabajador', plural: 'los trabajadores' },
  usuario: { singular: 'el usuario', plural: 'los usuarios' },
}

/**
 * Operation names for error messages
 */
export type OperationType = 'fetch' | 'create' | 'update' | 'delete' | 'search'

const OPERATION_LABELS: Record<OperationType, string> = {
  fetch: 'cargar',
  create: 'crear',
  update: 'actualizar',
  delete: 'eliminar',
  search: 'buscar',
}

/**
 * Create a user-friendly error message for entity operations
 */
export function createEntityErrorMessage(
  entity: EntityName,
  operation: OperationType,
  isPlural = false
): string {
  const entityLabel = isPlural
    ? ENTITY_LABELS[entity].plural
    : ENTITY_LABELS[entity].singular
  const operationLabel = OPERATION_LABELS[operation]
  return `Error al ${operationLabel} ${entityLabel}`
}

/**
 * Create a not found error message
 */
export function createNotFoundMessage(entity: EntityName): string {
  const capitalizedEntity = entity.charAt(0).toUpperCase() + entity.slice(1)
  return `${capitalizedEntity} no encontrado`
}

/**
 * Normalize any error into an AppError structure
 */
export function normalizeError(error: unknown, fallbackMessage: string): AppError {
  // Handle PermissionError
  if (error instanceof PermissionError) {
    return {
      type: 'PERMISSION_DENIED',
      message: error.message,
      userMessage: error.message,
      details: {
        module: error.module,
        action: error.action,
        userRole: error.userRole,
      },
    }
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('no encontrad')) {
      return {
        type: 'NOT_FOUND',
        message: error.message,
        userMessage: error.message,
      }
    }

    if (error.message.includes('permiso') || error.message.includes('autoriza')) {
      return {
        type: 'PERMISSION_DENIED',
        message: error.message,
        userMessage: error.message,
      }
    }

    if (error.name === 'ConstraintError' || error.name === 'DataError') {
      return {
        type: 'DATABASE_ERROR',
        message: error.message,
        userMessage: 'Error al guardar los datos',
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: fallbackMessage,
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: 'UNKNOWN_ERROR',
      message: error,
      userMessage: fallbackMessage,
    }
  }

  // Unknown error type
  return {
    type: 'UNKNOWN_ERROR',
    message: String(error),
    userMessage: fallbackMessage,
  }
}

/**
 * Handle store action errors with consistent logging and error structure
 */
export function handleStoreError(
  error: unknown,
  entity: EntityName,
  operation: OperationType,
  logPrefix: string
): AppError {
  const fallbackMessage = createEntityErrorMessage(entity, operation, operation === 'fetch')
  const appError = normalizeError(error, fallbackMessage)

  // Log error for debugging
  console.error(`${logPrefix} - ${operation}:`, {
    type: appError.type,
    message: appError.message,
    details: appError.details,
  })

  return appError
}

/**
 * Utility to check if an error is a permission error
 */
export function isPermissionError(error: unknown): error is PermissionError {
  return error instanceof PermissionError
}

/**
 * Utility to check if an error is a not found error
 */
export function isNotFoundError(error: AppError): boolean {
  return error.type === 'NOT_FOUND'
}
