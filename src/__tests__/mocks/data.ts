// Mock data for testing
// This file contains sample data used across tests

export const mockUsers = [
  {
    id: '1',
    email: 'admin@arl.com',
    nombre: 'Administrador',
    rol: 'admin' as const,
    activo: true,
  },
  {
    id: '2',
    email: 'supervisor@arl.com',
    nombre: 'Supervisor',
    rol: 'supervisor' as const,
    activo: true,
  },
  {
    id: '3',
    email: 'digitador@arl.com',
    nombre: 'Digitador',
    rol: 'digitador' as const,
    activo: true,
  },
  {
    id: '4',
    email: 'consultor@arl.com',
    nombre: 'Consultor',
    rol: 'consultor' as const,
    activo: true,
  },
]

export const mockCompanies = [
  {
    id: '1',
    nit: '900123456-1',
    razonSocial: 'Empresa ABC S.A.S',
    direccion: 'Calle 100 #15-20',
    telefono: '3001234567',
    email: 'contacto@empresaabc.com',
    activa: true,
  },
  {
    id: '2',
    nit: '800987654-2',
    razonSocial: 'Industrias XYZ Ltda',
    direccion: 'Carrera 50 #30-45',
    telefono: '3109876543',
    email: 'info@industriasxyz.com',
    activa: true,
  },
]

export const mockDocuments = [
  {
    id: '1',
    codigo: 'DOC-2024-00001',
    titulo: 'Politica SST 2024',
    tipo: 'POLITICA_SST',
    estado: 'aprobado',
    empresaId: '1',
    fechaCreacion: new Date('2024-01-15'),
    fechaActualizacion: new Date('2024-01-20'),
    fechaVigencia: new Date('2024-12-31'),
    creadoPor: '1',
    version: 1,
  },
  {
    id: '2',
    codigo: 'DOC-2024-00002',
    titulo: 'FURAT Accidente Bodega',
    tipo: 'FURAT',
    estado: 'pendiente_revision',
    empresaId: '1',
    fechaCreacion: new Date('2024-01-18'),
    fechaActualizacion: new Date('2024-01-18'),
    creadoPor: '3',
    version: 1,
  },
]
