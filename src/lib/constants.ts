// Seed data version - increment when password hashing algorithm changes
export const SEED_VERSION = 2 // v2 = bcrypt hashing

// Document status values
export const DOCUMENT_STATUS = {
  BORRADOR: 'borrador',
  PENDIENTE_REVISION: 'pendiente_revision',
  EN_REVISION: 'en_revision',
  REQUIERE_CORRECCION: 'requiere_correccion',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  VENCIDO: 'vencido',
  ARCHIVADO: 'archivado',
} as const

// Document types
export const DOCUMENT_TYPES = {
  // Afiliacion
  AFIL_EMP: 'Afiliacion Empresa',
  AFIL_TRAB: 'Afiliacion Trabajador',
  NOV_RET: 'Novedad Retiro',
  NOV_TRAS: 'Novedad Traslado',

  // Siniestralidad
  FURAT: 'FURAT - Accidente de Trabajo',
  FUREP: 'FUREP - Enfermedad Profesional',
  INV_AT: 'Investigacion Accidente de Trabajo',
  CALIF_ORIGEN: 'Calificacion de Origen',

  // SG-SST
  POL_SST: 'Politica SST',
  MAT_PEL: 'Matriz de Peligros',
  PLAN_SST: 'Plan de Trabajo Anual',
  IND_SST: 'Indicadores SST',
  ACTA_COP: 'Acta COPASST',
  CAP_SST: 'Capacitacion SST',

  // Legales
  CONTRATO: 'Contrato',
  CERT_AFIL: 'Certificado de Afiliacion',
  CERT_APOR: 'Certificado de Aportes',
  PODER: 'Poder',
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  DIGITADOR: 'digitador',
  CONSULTOR: 'consultor',
} as const

// Role labels
export const ROLE_LABELS = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  digitador: 'Digitador',
  consultor: 'Consultor',
} as const

// Status labels and colors
export const STATUS_CONFIG = {
  borrador: { label: 'Borrador', color: 'secondary' },
  pendiente_revision: { label: 'Pendiente Revision', color: 'warning' },
  en_revision: { label: 'En Revision', color: 'default' },
  requiere_correccion: { label: 'Requiere Correccion', color: 'warning' },
  aprobado: { label: 'Aprobado', color: 'success' },
  rechazado: { label: 'Rechazado', color: 'destructive' },
  vencido: { label: 'Vencido', color: 'destructive' },
  archivado: { label: 'Archivado', color: 'outline' },
} as const

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'image/png', 'image/jpeg'],
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg'],
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

// Workflow actions
export const WORKFLOW_ACTIONS = {
  ENVIAR_REVISION: 'ENVIAR_REVISION',
  INICIAR_REVISION: 'INICIAR_REVISION',
  APROBAR: 'APROBAR',
  RECHAZAR: 'RECHAZAR',
  SOLICITAR_CORRECCION: 'SOLICITAR_CORRECCION',
  CORREGIR: 'CORREGIR',
  ARCHIVAR: 'ARCHIVAR',
} as const

// Audit actions
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  STATUS_CHANGE: 'STATUS_CHANGE',
  EXPORT: 'EXPORT',
} as const

// Storage keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  LOGIN_ATTEMPTS: 'login-attempts',
} as const

// Security configuration
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
} as const

// Document code prefixes
export const DOCUMENT_PREFIXES: Record<string, string> = {
  AFIL_EMP: 'AFIL',
  AFIL_TRAB: 'AFIL',
  NOV_RET: 'NOV',
  NOV_TRAS: 'NOV',
  FURAT: 'FURAT',
  FUREP: 'FUREP',
  INV_AT: 'INV',
  CALIF_ORIGEN: 'CALIF',
  POL_SST: 'POL',
  MAT_PEL: 'MAT',
  PLAN_SST: 'PLAN',
  IND_SST: 'IND',
  ACTA_COP: 'ACTA',
  CAP_SST: 'CAP',
  CONTRATO: 'CONT',
  CERT_AFIL: 'CERT',
  CERT_APOR: 'CERT',
  PODER: 'POD',
  default: 'DOC',
}

// Badge variant mapping for status colors
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  success: 'default',
  warning: 'secondary',
  destructive: 'destructive',
  default: 'secondary',
  secondary: 'secondary',
  outline: 'outline',
}

/**
 * Get badge variant from status config color
 */
export function getStatusBadgeVariant(statusColor: string): BadgeVariant {
  return STATUS_VARIANT_MAP[statusColor] || 'secondary'
}
