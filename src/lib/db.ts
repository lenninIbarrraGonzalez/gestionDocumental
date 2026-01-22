import Dexie, { type Table } from 'dexie'

// Document entity
export interface Document {
  id: string
  codigo: string
  titulo: string
  descripcion?: string
  tipo: string
  estado: string
  empresaId: string
  trabajadorId?: string
  archivoUrl?: string
  archivoNombre?: string
  archivoTamano?: number
  archivoTipo?: string
  fechaCreacion: Date
  fechaActualizacion: Date
  fechaVigencia?: Date
  creadoPor: string
  actualizadoPor?: string
  revisorId?: string
  version: number
  observaciones?: string
}

// Company entity
export interface Company {
  id: string
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
  activa: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}

// Worker entity
export interface Worker {
  id: string
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
  activo: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}

// User entity
export interface User {
  id: string
  email: string
  passwordHash: string
  nombre: string
  apellido: string
  rol: 'admin' | 'supervisor' | 'digitador' | 'consultor'
  activo: boolean
  ultimoAcceso?: Date
  fechaCreacion: Date
  fechaActualizacion: Date
}

// Audit log entity
export interface AuditLog {
  id: string
  entidad: string
  entidadId: string
  accion: string
  cambios?: Record<string, { antes: unknown; despues: unknown }>
  usuarioId: string
  usuarioEmail: string
  timestamp: Date
  descripcion?: string
}

// Notification entity
export interface Notification {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  usuarioId: string
  leida: boolean
  entidadTipo?: string
  entidadId?: string
  fechaCreacion: Date
}

// Workflow history entity
export interface WorkflowHistory {
  id: string
  documentoId: string
  accion: string
  estadoAnterior: string
  estadoNuevo: string
  usuarioId: string
  comentario?: string
  timestamp: Date
}

// Database class
class GestionDocumentalDB extends Dexie {
  documents!: Table<Document>
  companies!: Table<Company>
  workers!: Table<Worker>
  users!: Table<User>
  auditLogs!: Table<AuditLog>
  notifications!: Table<Notification>
  workflowHistory!: Table<WorkflowHistory>

  constructor() {
    super('GestionDocumentalDB')

    this.version(1).stores({
      documents:
        'id, codigo, tipo, estado, empresaId, trabajadorId, creadoPor, fechaCreacion, fechaVigencia',
      companies: 'id, nit, razonSocial, activa',
      workers: 'id, documento, empresaId, activo',
      users: 'id, email, rol, activo',
      auditLogs: 'id, entidad, entidadId, accion, usuarioId, timestamp',
      notifications: 'id, usuarioId, leida, fechaCreacion',
      workflowHistory: 'id, documentoId, timestamp',
    })

    // Version 2: Add compound indexes for optimized queries
    this.version(2).stores({
      documents:
        'id, codigo, tipo, estado, empresaId, trabajadorId, creadoPor, fechaCreacion, fechaVigencia, [estado+empresaId], [tipo+estado], [empresaId+tipo], [estado+fechaCreacion]',
      companies: 'id, nit, razonSocial, activa',
      workers: 'id, documento, empresaId, activo, [empresaId+activo]',
      users: 'id, email, rol, activo, [rol+activo]',
      auditLogs: 'id, entidad, entidadId, accion, usuarioId, timestamp, [entidad+accion], [usuarioId+timestamp]',
      notifications: 'id, usuarioId, leida, fechaCreacion, [usuarioId+leida]',
      workflowHistory: 'id, documentoId, timestamp, [documentoId+timestamp]',
    })
  }
}

export const db = new GestionDocumentalDB()
