import type { Company, Worker, User, Document, AuditLog, Notification } from '@/lib/db'
import { generateId, hashPassword } from '@/lib/generators'
import { DOCUMENT_TYPES, DOCUMENT_STATUS, AUDIT_ACTIONS, DOCUMENT_PREFIXES } from '@/lib/constants'

// Helper to create dates relative to today
const daysAgo = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const daysFromNow = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// =============================================================================
// USUARIOS (4)
// =============================================================================
export const seedUsers: User[] = [
  {
    id: 'user-admin-001',
    email: 'admin@arl.com',
    passwordHash: hashPassword('Admin123!'),
    nombre: 'Carlos',
    apellido: 'Rodriguez',
    rol: 'admin',
    activo: true,
    ultimoAcceso: daysAgo(0),
    fechaCreacion: daysAgo(365),
    fechaActualizacion: daysAgo(0),
  },
  {
    id: 'user-supervisor-001',
    email: 'supervisor@arl.com',
    passwordHash: hashPassword('Super123!'),
    nombre: 'Maria',
    apellido: 'Gonzalez',
    rol: 'supervisor',
    activo: true,
    ultimoAcceso: daysAgo(1),
    fechaCreacion: daysAgo(300),
    fechaActualizacion: daysAgo(1),
  },
  {
    id: 'user-digitador-001',
    email: 'digitador@arl.com',
    passwordHash: hashPassword('Digit123!'),
    nombre: 'Juan',
    apellido: 'Martinez',
    rol: 'digitador',
    activo: true,
    ultimoAcceso: daysAgo(0),
    fechaCreacion: daysAgo(200),
    fechaActualizacion: daysAgo(0),
  },
  {
    id: 'user-consultor-001',
    email: 'consultor@arl.com',
    passwordHash: hashPassword('Consul123!'),
    nombre: 'Ana',
    apellido: 'Lopez',
    rol: 'consultor',
    activo: true,
    ultimoAcceso: daysAgo(3),
    fechaCreacion: daysAgo(150),
    fechaActualizacion: daysAgo(3),
  },
]

// =============================================================================
// EMPRESAS (5)
// =============================================================================
export const seedCompanies: Company[] = [
  {
    id: 'company-001',
    nit: '900123456',
    digitoVerificacion: '1',
    razonSocial: 'Constructora ABC S.A.S.',
    nombreComercial: 'Constructora ABC',
    direccion: 'Calle 100 # 15-20',
    ciudad: 'Bogota',
    departamento: 'Cundinamarca',
    telefono: '6011234567',
    email: 'contacto@constructoraabc.com',
    representanteLegal: 'Pedro Sanchez Garcia',
    activa: true,
    fechaCreacion: daysAgo(365),
    fechaActualizacion: daysAgo(30),
  },
  {
    id: 'company-002',
    nit: '900234567',
    digitoVerificacion: '2',
    razonSocial: 'Transportes del Norte Ltda.',
    nombreComercial: 'Transnorte',
    direccion: 'Carrera 45 # 85-60',
    ciudad: 'Medellin',
    departamento: 'Antioquia',
    telefono: '6042345678',
    email: 'info@transnorte.com',
    representanteLegal: 'Luis Fernando Mejia',
    activa: true,
    fechaCreacion: daysAgo(300),
    fechaActualizacion: daysAgo(15),
  },
  {
    id: 'company-003',
    nit: '900345678',
    digitoVerificacion: '3',
    razonSocial: 'Alimentos del Valle S.A.',
    nombreComercial: 'AlimentosValle',
    direccion: 'Avenida 3N # 50-25',
    ciudad: 'Cali',
    departamento: 'Valle del Cauca',
    telefono: '6023456789',
    email: 'rrhh@alimentosvalle.com',
    representanteLegal: 'Carmen Rosa Perea',
    activa: true,
    fechaCreacion: daysAgo(250),
    fechaActualizacion: daysAgo(10),
  },
  {
    id: 'company-004',
    nit: '900456789',
    digitoVerificacion: '4',
    razonSocial: 'Metalmecanica Industrial S.A.S.',
    nombreComercial: 'MetalInd',
    direccion: 'Zona Industrial Km 5',
    ciudad: 'Barranquilla',
    departamento: 'Atlantico',
    telefono: '6054567890',
    email: 'gerencia@metalind.com',
    representanteLegal: 'Roberto Carlos Vega',
    activa: true,
    fechaCreacion: daysAgo(180),
    fechaActualizacion: daysAgo(5),
  },
  {
    id: 'company-005',
    nit: '900567890',
    digitoVerificacion: '5',
    razonSocial: 'Servicios Tecnologicos SAS',
    nombreComercial: 'ServiTech',
    direccion: 'Centro Empresarial Torre Norte Oficina 501',
    ciudad: 'Bogota',
    departamento: 'Cundinamarca',
    telefono: '6015678901',
    email: 'contacto@servitech.com',
    representanteLegal: 'Diana Patricia Ruiz',
    activa: false, // Empresa inactiva para testing
    fechaCreacion: daysAgo(120),
    fechaActualizacion: daysAgo(60),
  },
]

// =============================================================================
// TRABAJADORES (55)
// =============================================================================
const workerNames = [
  { nombres: 'Andres Felipe', apellidos: 'Garcia Perez', cargo: 'Ingeniero Civil' },
  { nombres: 'Laura Marcela', apellidos: 'Rodriguez Lopez', cargo: 'Arquitecta' },
  { nombres: 'Carlos Alberto', apellidos: 'Martinez Gomez', cargo: 'Maestro de Obra' },
  { nombres: 'Diana Carolina', apellidos: 'Sanchez Vargas', cargo: 'Asistente Administrativa' },
  { nombres: 'Jorge Luis', apellidos: 'Hernandez Torres', cargo: 'Operario' },
  { nombres: 'Maria Fernanda', apellidos: 'Lopez Ruiz', cargo: 'Coordinadora SST' },
  { nombres: 'Oscar David', apellidos: 'Gonzalez Castro', cargo: 'Conductor' },
  { nombres: 'Paola Andrea', apellidos: 'Diaz Moreno', cargo: 'Contadora' },
  { nombres: 'Ricardo Andres', apellidos: 'Vargas Soto', cargo: 'Supervisor' },
  { nombres: 'Sandra Milena', apellidos: 'Castro Rojas', cargo: 'Recepcionista' },
  { nombres: 'William Fernando', apellidos: 'Perez Gutierrez', cargo: 'Electricista' },
  { nombres: 'Angela Patricia', apellidos: 'Morales Cruz', cargo: 'Auxiliar de Bodega' },
  { nombres: 'Diego Alejandro', apellidos: 'Rojas Mendez', cargo: 'Mecanico' },
  { nombres: 'Luz Marina', apellidos: 'Gutierrez Ortiz', cargo: 'Auxiliar de Servicios' },
  { nombres: 'Miguel Angel', apellidos: 'Cruz Jimenez', cargo: 'Soldador' },
  { nombres: 'Patricia Elena', apellidos: 'Mendez Herrera', cargo: 'Jefe de Recursos Humanos' },
  { nombres: 'Roberto Carlos', apellidos: 'Ortiz Cardenas', cargo: 'Almacenista' },
  { nombres: 'Teresa de Jesus', apellidos: 'Jimenez Suarez', cargo: 'Operaria de Produccion' },
  { nombres: 'Victor Manuel', apellidos: 'Herrera Pardo', cargo: 'Vigilante' },
  { nombres: 'Yolanda Patricia', apellidos: 'Cardenas Beltran', cargo: 'Auxiliar Contable' },
  { nombres: 'Alexander', apellidos: 'Suarez Romero', cargo: 'Tornero' },
  { nombres: 'Beatriz Elena', apellidos: 'Pardo Castillo', cargo: 'Secretaria General' },
  { nombres: 'Cesar Augusto', apellidos: 'Beltran Aguilar', cargo: 'Pintor Industrial' },
  { nombres: 'Daniela Fernanda', apellidos: 'Romero Valencia', cargo: 'Ingeniera Industrial' },
  { nombres: 'Eduardo Jose', apellidos: 'Castillo Molina', cargo: 'Jefe de Planta' },
  { nombres: 'Fabiola', apellidos: 'Aguilar Rios', cargo: 'Auxiliar de Nomina' },
  { nombres: 'Gustavo Adolfo', apellidos: 'Valencia Duarte', cargo: 'Operador de Maquinaria' },
  { nombres: 'Helena Maria', apellidos: 'Molina Fuentes', cargo: 'Diseñadora Grafica' },
  { nombres: 'Ivan Dario', apellidos: 'Rios Salazar', cargo: 'Tecnico de Mantenimiento' },
  { nombres: 'Juliana', apellidos: 'Duarte Medina', cargo: 'Analista de Calidad' },
  { nombres: 'Kevin Andres', apellidos: 'Fuentes Ospina', cargo: 'Ayudante de Construccion' },
  { nombres: 'Liliana Marcela', apellidos: 'Salazar Restrepo', cargo: 'Coordinadora de Proyectos' },
  { nombres: 'Manuel Antonio', apellidos: 'Medina Zapata', cargo: 'Chofer de Camion' },
  { nombres: 'Natalia', apellidos: 'Ospina Londono', cargo: 'Asistente de Gerencia' },
  { nombres: 'Omar Fernando', apellidos: 'Restrepo Gil', cargo: 'Operario de Montacargas' },
  { nombres: 'Paula Alejandra', apellidos: 'Zapata Correa', cargo: 'Quimica de Alimentos' },
  { nombres: 'Quintero', apellidos: 'Londono Velez', cargo: 'Empacador' },
  { nombres: 'Rosa Elvira', apellidos: 'Gil Echeverri', cargo: 'Cajera' },
  { nombres: 'Sebastian', apellidos: 'Correa Arango', cargo: 'Programador' },
  { nombres: 'Tatiana', apellidos: 'Velez Henao', cargo: 'Vendedora' },
  { nombres: 'Uriel', apellidos: 'Echeverri Botero', cargo: 'Mensajero' },
  { nombres: 'Valentina', apellidos: 'Arango Escobar', cargo: 'Community Manager' },
  { nombres: 'Wilson Andres', apellidos: 'Henao Ramirez', cargo: 'Tecnico Electronico' },
  { nombres: 'Ximena', apellidos: 'Botero Fernandez', cargo: 'Abogada' },
  { nombres: 'Yeison Fabian', apellidos: 'Escobar Silva', cargo: 'Auxiliar de Cocina' },
  { nombres: 'Zoraida', apellidos: 'Ramirez Acosta', cargo: 'Enfermera Ocupacional' },
  { nombres: 'Alberto Jose', apellidos: 'Fernandez Marin', cargo: 'Jefe de Seguridad' },
  { nombres: 'Brenda Lucia', apellidos: 'Silva Cano', cargo: 'Asesora Comercial' },
  { nombres: 'Cristian Camilo', apellidos: 'Acosta Reyes', cargo: 'Instalador' },
  { nombres: 'Dora Ines', apellidos: 'Marin Tovar', cargo: 'Asistente de Compras' },
  { nombres: 'Ernesto', apellidos: 'Cano Bernal', cargo: 'Carpintero' },
  { nombres: 'Francy Liliana', apellidos: 'Reyes Murillo', cargo: 'Recepcionista' },
  { nombres: 'Gerardo', apellidos: 'Tovar Ortega', cargo: 'Plomero' },
  { nombres: 'Hilda Rosa', apellidos: 'Bernal Cifuentes', cargo: 'Auxiliar de Archivo' },
  { nombres: 'Ignacio', apellidos: 'Murillo Rincon', cargo: 'Ayudante General' },
]

const areas = ['Produccion', 'Administracion', 'Logistica', 'Mantenimiento', 'Comercial', 'SST', 'Calidad']

export const seedWorkers: Worker[] = workerNames.map((worker, index) => {
  const companyIndex = index % 5
  const companyId = seedCompanies[companyIndex].id

  return {
    id: `worker-${String(index + 1).padStart(3, '0')}`,
    tipoDocumento: index % 10 === 0 ? 'CE' : 'CC',
    documento: String(1000000000 + index),
    nombres: worker.nombres,
    apellidos: worker.apellidos,
    email: `${worker.nombres.toLowerCase().replace(/ /g, '.')}@email.com`,
    telefono: `3${String(100000000 + index)}`,
    cargo: worker.cargo,
    area: areas[index % areas.length],
    empresaId: companyId,
    fechaIngreso: daysAgo(Math.floor(Math.random() * 365) + 30),
    activo: index % 15 !== 0, // Some inactive workers
    fechaCreacion: daysAgo(Math.floor(Math.random() * 365) + 30),
    fechaActualizacion: daysAgo(Math.floor(Math.random() * 30)),
  }
})

// =============================================================================
// DOCUMENTOS (60+)
// =============================================================================
const documentTypes = Object.keys(DOCUMENT_TYPES) as (keyof typeof DOCUMENT_TYPES)[]
const documentStatuses = [
  DOCUMENT_STATUS.BORRADOR,
  DOCUMENT_STATUS.PENDIENTE_REVISION,
  DOCUMENT_STATUS.EN_REVISION,
  DOCUMENT_STATUS.APROBADO,
  DOCUMENT_STATUS.RECHAZADO,
  DOCUMENT_STATUS.VENCIDO,
]

const documentTitles: Record<string, string[]> = {
  AFIL_EMP: ['Afiliacion Empresa', 'Formulario Afiliacion Empresa', 'Vinculacion Empresa'],
  AFIL_TRAB: ['Afiliacion Trabajador', 'Vinculacion Trabajador', 'Formulario Afiliacion'],
  NOV_RET: ['Novedad Retiro', 'Desvinculacion Trabajador', 'Reporte Retiro'],
  NOV_TRAS: ['Novedad Traslado', 'Cambio de ARL', 'Traslado Empresa'],
  FURAT: ['FURAT Accidente Trabajo', 'Reporte Accidente', 'FURAT'],
  FUREP: ['FUREP Enfermedad', 'Reporte Enfermedad Laboral', 'FUREP'],
  INV_AT: ['Investigacion Accidente', 'Informe Investigacion AT', 'Analisis Accidente'],
  CALIF_ORIGEN: ['Calificacion Origen', 'Dictamen Origen', 'Calificacion Primera Oportunidad'],
  POL_SST: ['Politica SST', 'Politica de Seguridad', 'Politica SGSST'],
  MAT_PEL: ['Matriz Peligros', 'Matriz de Riesgos', 'Identificacion Peligros'],
  PLAN_SST: ['Plan Trabajo Anual', 'Plan SST', 'Cronograma SST'],
  IND_SST: ['Indicadores SST', 'Dashboard SST', 'Metricas Seguridad'],
  ACTA_COP: ['Acta COPASST', 'Acta Comite Paritario', 'Reunion COPASST'],
  CAP_SST: ['Capacitacion SST', 'Entrenamiento Seguridad', 'Induccion SST'],
  CONTRATO: ['Contrato Servicio', 'Contrato ARL', 'Convenio'],
  CERT_AFIL: ['Certificado Afiliacion', 'Constancia Afiliacion', 'Certificado ARL'],
  CERT_APOR: ['Certificado Aportes', 'Paz y Salvo Aportes', 'Estado de Cuenta'],
  PODER: ['Poder General', 'Poder Especial', 'Autorizacion'],
}

let documentCounter = 1

export const seedDocuments: Document[] = []

// Generate documents for each company
seedCompanies.forEach((company, companyIndex) => {
  // Each company gets 12 documents
  for (let i = 0; i < 12; i++) {
    const docType = documentTypes[i % documentTypes.length]
    const status = documentStatuses[(companyIndex + i) % documentStatuses.length]
    const titles = documentTitles[docType] || ['Documento']
    const title = titles[i % titles.length]
    const daysOld = Math.floor(Math.random() * 180) + 1

    // Find a worker from this company for worker-related documents
    const companyWorkers = seedWorkers.filter((w) => w.empresaId === company.id)
    const worker = companyWorkers[i % companyWorkers.length]

    const isWorkerDoc = ['AFIL_TRAB', 'NOV_RET', 'FURAT', 'FUREP', 'INV_AT', 'CALIF_ORIGEN'].includes(
      docType
    )

    // Calculate vigencia (expiration) - some documents expiring soon
    let fechaVigencia: Date | undefined
    if (status === DOCUMENT_STATUS.APROBADO) {
      if (i % 4 === 0) {
        fechaVigencia = daysFromNow(15) // Expiring soon
      } else if (i % 5 === 0) {
        fechaVigencia = daysAgo(5) // Already expired (but status not updated)
      } else {
        fechaVigencia = daysFromNow(180) // Normal expiration
      }
    }

    const prefix = DOCUMENT_PREFIXES[docType] || DOCUMENT_PREFIXES.default
    const year = 2024

    seedDocuments.push({
      id: `doc-${String(documentCounter).padStart(5, '0')}`,
      codigo: `${prefix}-${year}-${String(documentCounter).padStart(5, '0')}`,
      titulo: `${title} - ${company.nombreComercial || company.razonSocial}${isWorkerDoc && worker ? ` - ${worker.nombres} ${worker.apellidos}` : ''}`,
      descripcion: `Documento de ${DOCUMENT_TYPES[docType as keyof typeof DOCUMENT_TYPES]} correspondiente a la empresa ${company.razonSocial}`,
      tipo: docType,
      estado: status,
      empresaId: company.id,
      trabajadorId: isWorkerDoc && worker ? worker.id : undefined,
      archivoNombre: `${docType.toLowerCase()}_${company.nit}_${documentCounter}.pdf`,
      archivoTamano: Math.floor(Math.random() * 5000000) + 100000,
      archivoTipo: 'application/pdf',
      fechaCreacion: daysAgo(daysOld),
      fechaActualizacion: daysAgo(Math.floor(daysOld / 2)),
      fechaVigencia,
      creadoPor: seedUsers[companyIndex % seedUsers.length].id,
      actualizadoPor:
        status !== DOCUMENT_STATUS.BORRADOR ? seedUsers[(companyIndex + 1) % seedUsers.length].id : undefined,
      revisorId:
        status === DOCUMENT_STATUS.EN_REVISION || status === DOCUMENT_STATUS.APROBADO
          ? 'user-supervisor-001'
          : undefined,
      version: status === DOCUMENT_STATUS.APROBADO ? 2 : 1,
      observaciones:
        status === DOCUMENT_STATUS.RECHAZADO
          ? 'Documento incompleto, falta firma del representante legal'
          : undefined,
    })

    documentCounter++
  }
})

// =============================================================================
// AUDIT LOGS (100+ entries spanning 30 days)
// =============================================================================
export const seedAuditLogs: AuditLog[] = []

// Generate audit logs for various actions
const auditActions = [
  { accion: AUDIT_ACTIONS.CREATE, descripcion: 'Documento creado' },
  { accion: AUDIT_ACTIONS.UPDATE, descripcion: 'Documento actualizado' },
  { accion: AUDIT_ACTIONS.VIEW, descripcion: 'Documento visualizado' },
  { accion: AUDIT_ACTIONS.STATUS_CHANGE, descripcion: 'Estado de documento modificado' },
  { accion: AUDIT_ACTIONS.LOGIN, descripcion: 'Inicio de sesion' },
  { accion: AUDIT_ACTIONS.LOGOUT, descripcion: 'Cierre de sesion' },
  { accion: AUDIT_ACTIONS.EXPORT, descripcion: 'Exportacion de reporte' },
]

let auditCounter = 1

// Login/Logout logs for past 30 days
for (let day = 0; day < 30; day++) {
  seedUsers.forEach((user) => {
    if (Math.random() > 0.3) {
      // 70% chance of login each day
      seedAuditLogs.push({
        id: `audit-${String(auditCounter++).padStart(5, '0')}`,
        entidad: 'users',
        entidadId: user.id,
        accion: AUDIT_ACTIONS.LOGIN,
        usuarioId: user.id,
        usuarioEmail: user.email,
        timestamp: new Date(daysAgo(day).setHours(8, Math.floor(Math.random() * 60), 0)),
        descripcion: 'Inicio de sesion exitoso',
      })

      if (Math.random() > 0.2) {
        // 80% chance of logout if logged in
        seedAuditLogs.push({
          id: `audit-${String(auditCounter++).padStart(5, '0')}`,
          entidad: 'users',
          entidadId: user.id,
          accion: AUDIT_ACTIONS.LOGOUT,
          usuarioId: user.id,
          usuarioEmail: user.email,
          timestamp: new Date(daysAgo(day).setHours(17, Math.floor(Math.random() * 60), 0)),
          descripcion: 'Cierre de sesion',
        })
      }
    }
  })
}

// Document action logs
seedDocuments.forEach((doc, index) => {
  const creator = seedUsers.find((u) => u.id === doc.creadoPor) || seedUsers[0]

  // Creation log
  seedAuditLogs.push({
    id: `audit-${String(auditCounter++).padStart(5, '0')}`,
    entidad: 'documents',
    entidadId: doc.id,
    accion: AUDIT_ACTIONS.CREATE,
    usuarioId: creator.id,
    usuarioEmail: creator.email,
    timestamp: doc.fechaCreacion,
    descripcion: `Documento ${doc.codigo} creado`,
  })

  // View logs (random)
  if (Math.random() > 0.5) {
    const viewer = seedUsers[Math.floor(Math.random() * seedUsers.length)]
    seedAuditLogs.push({
      id: `audit-${String(auditCounter++).padStart(5, '0')}`,
      entidad: 'documents',
      entidadId: doc.id,
      accion: AUDIT_ACTIONS.VIEW,
      usuarioId: viewer.id,
      usuarioEmail: viewer.email,
      timestamp: new Date(doc.fechaCreacion.getTime() + Math.random() * 86400000),
      descripcion: `Documento ${doc.codigo} visualizado`,
    })
  }

  // Status change logs for non-draft documents
  if (doc.estado !== DOCUMENT_STATUS.BORRADOR) {
    const reviewer = seedUsers.find((u) => u.rol === 'supervisor') || seedUsers[1]
    seedAuditLogs.push({
      id: `audit-${String(auditCounter++).padStart(5, '0')}`,
      entidad: 'documents',
      entidadId: doc.id,
      accion: AUDIT_ACTIONS.STATUS_CHANGE,
      cambios: {
        estado: {
          antes: DOCUMENT_STATUS.BORRADOR,
          despues: doc.estado,
        },
      },
      usuarioId: reviewer.id,
      usuarioEmail: reviewer.email,
      timestamp: doc.fechaActualizacion,
      descripcion: `Estado de documento ${doc.codigo} cambiado a ${doc.estado}`,
    })
  }
})

// Export logs
for (let i = 0; i < 10; i++) {
  const user = seedUsers[Math.floor(Math.random() * seedUsers.length)]
  seedAuditLogs.push({
    id: `audit-${String(auditCounter++).padStart(5, '0')}`,
    entidad: 'reports',
    entidadId: `report-${i + 1}`,
    accion: AUDIT_ACTIONS.EXPORT,
    usuarioId: user.id,
    usuarioEmail: user.email,
    timestamp: daysAgo(Math.floor(Math.random() * 30)),
    descripcion: 'Exportacion de reporte de documentos',
  })
}

// =============================================================================
// NOTIFICATIONS (20+)
// =============================================================================
export const seedNotifications: Notification[] = []

let notificationCounter = 1

// Document approval/rejection notifications
seedDocuments
  .filter((d) => d.estado === DOCUMENT_STATUS.APROBADO || d.estado === DOCUMENT_STATUS.RECHAZADO)
  .slice(0, 10)
  .forEach((doc) => {
    const creator = seedUsers.find((u) => u.id === doc.creadoPor) || seedUsers[0]
    const isApproved = doc.estado === DOCUMENT_STATUS.APROBADO

    seedNotifications.push({
      id: `notif-${String(notificationCounter++).padStart(5, '0')}`,
      tipo: isApproved ? 'document_approved' : 'document_rejected',
      titulo: isApproved ? 'Documento aprobado' : 'Documento rechazado',
      mensaje: isApproved
        ? `El documento "${doc.titulo}" ha sido aprobado.`
        : `El documento "${doc.titulo}" ha sido rechazado. Motivo: ${doc.observaciones || 'Sin especificar'}`,
      usuarioId: creator.id,
      leida: Math.random() > 0.5,
      entidadTipo: 'documents',
      entidadId: doc.id,
      fechaCreacion: doc.fechaActualizacion,
    })
  })

// Expiring document notifications
seedDocuments
  .filter((d) => d.fechaVigencia && d.fechaVigencia > new Date() && d.fechaVigencia < daysFromNow(30))
  .forEach((doc) => {
    const creator = seedUsers.find((u) => u.id === doc.creadoPor) || seedUsers[0]
    const daysUntilExpiry = Math.ceil(
      (doc.fechaVigencia!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    seedNotifications.push({
      id: `notif-${String(notificationCounter++).padStart(5, '0')}`,
      tipo: 'document_expiring',
      titulo: 'Documento proximo a vencer',
      mensaje: `El documento "${doc.titulo}" vencera en ${daysUntilExpiry} dias.`,
      usuarioId: creator.id,
      leida: false,
      entidadTipo: 'documents',
      entidadId: doc.id,
      fechaCreacion: daysAgo(1),
    })
  })

// System notifications
seedUsers.forEach((user) => {
  seedNotifications.push({
    id: `notif-${String(notificationCounter++).padStart(5, '0')}`,
    tipo: 'system',
    titulo: 'Bienvenido al sistema',
    mensaje: 'Bienvenido al Sistema de Gestion Documental ARL. Recuerde mantener sus documentos actualizados.',
    usuarioId: user.id,
    leida: true,
    fechaCreacion: user.fechaCreacion,
  })
})

// =============================================================================
// SEED DATA EXPORT
// =============================================================================
export const seedData = {
  users: seedUsers,
  companies: seedCompanies,
  workers: seedWorkers,
  documents: seedDocuments,
  auditLogs: seedAuditLogs,
  notifications: seedNotifications,
}

export default seedData
