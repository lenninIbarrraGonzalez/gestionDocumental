// Re-export database types
export type {
  Document,
  Company,
  Worker,
  User,
  AuditLog,
  Notification,
  WorkflowHistory,
} from '@/lib/db'

// Document status type
export type DocumentStatus =
  | 'borrador'
  | 'pendiente_revision'
  | 'en_revision'
  | 'requiere_correccion'
  | 'aprobado'
  | 'rechazado'
  | 'vencido'
  | 'archivado'

// User role type
export type UserRole = 'admin' | 'supervisor' | 'digitador' | 'consultor'

// Workflow action type
export type WorkflowAction =
  | 'ENVIAR_REVISION'
  | 'INICIAR_REVISION'
  | 'APROBAR'
  | 'RECHAZAR'
  | 'SOLICITAR_CORRECCION'
  | 'CORREGIR'
  | 'ARCHIVAR'

// Audit action type
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'STATUS_CHANGE'
  | 'EXPORT'

// Filter types
export interface DocumentFilter {
  estado?: DocumentStatus | 'all'
  tipo?: string | 'all'
  empresaId?: string | 'all'
  fechaDesde?: Date
  fechaHasta?: Date
  search?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

// Form types
export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateDocumentDTO {
  titulo: string
  descripcion?: string
  tipo: string
  empresaId: string
  trabajadorId?: string
  fechaVigencia?: Date
}

export interface UpdateDocumentDTO extends Partial<CreateDocumentDTO> {
  observaciones?: string
}

export interface CreateCompanyDTO {
  nit: string
  digitoVerificacion: string
  razonSocial: string
  nombreComercial?: string
  direccion: string
  ciudad: string
  departamento: string
  telefono: string
  email: string
  representanteLegal: string
}

export interface CreateWorkerDTO {
  tipoDocumento: string
  documento: string
  nombres: string
  apellidos: string
  email?: string
  telefono?: string
  cargo: string
  area?: string
  empresaId: string
  fechaIngreso: Date
}

export interface CreateUserDTO {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: UserRole
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
