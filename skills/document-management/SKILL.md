# Skill: Document Management - ARL Colombiana

## Contexto del Dominio

### Que es una ARL?
Una **Administradora de Riesgos Laborales (ARL)** es una entidad colombiana encargada de:
- Prevenir accidentes y enfermedades laborales
- Atender trabajadores con accidentes de trabajo
- Gestionar prestaciones economicas por incapacidades
- Realizar actividades de promocion y prevencion

### Marco Normativo
- **Decreto 1072 de 2015**: Decreto Unico Reglamentario del Sector Trabajo
- **Resolucion 0312 de 2019**: Estandares Minimos del SG-SST
- **Ley 1562 de 2012**: Sistema General de Riesgos Laborales

## Tipos de Documentos ARL

### 1. Documentos de Afiliacion
| Tipo | Codigo | Vigencia |
|------|--------|----------|
| Afiliacion Empresa | `AFIL_EMP` | Permanente |
| Afiliacion Trabajador | `AFIL_TRAB` | Permanente |
| Novedad Retiro | `NOV_RET` | Permanente |

### 2. Documentos de Siniestralidad
| Tipo | Codigo | Vigencia |
|------|--------|----------|
| FURAT | `FURAT` | 5 anos |
| FUREP | `FUREP` | 5 anos |
| Investigacion AT | `INV_AT` | 5 anos |

### 3. Documentos SG-SST
| Tipo | Codigo | Vigencia |
|------|--------|----------|
| Politica SST | `POL_SST` | Anual |
| Matriz Peligros | `MAT_PEL` | Anual |
| Plan Trabajo Anual | `PLAN_SST` | Anual |
| Acta COPASST | `ACTA_COP` | 2 anos |

### 4. Documentos Legales
| Tipo | Codigo | Vigencia |
|------|--------|----------|
| Contrato | `CONTRATO` | Variable |
| Certificado Afiliacion | `CERT_AFIL` | 30 dias |
| Certificado Aportes | `CERT_APOR` | 30 dias |

## Estados del Documento

```typescript
type DocumentStatus =
  | 'borrador'
  | 'pendiente_revision'
  | 'en_revision'
  | 'requiere_correccion'
  | 'aprobado'
  | 'rechazado'
  | 'vencido'
  | 'archivado';
```

### Transiciones Validas
- `borrador` -> `pendiente_revision`
- `pendiente_revision` -> `en_revision`
- `en_revision` -> `aprobado` | `rechazado` | `requiere_correccion`
- `requiere_correccion` -> `borrador`
- `aprobado` -> `archivado` | `vencido`

## Codificacion de Documentos

Formato: `{PREFIJO}-{AÑO}-{SECUENCIAL}`

Ejemplo: `DOC-2024-00001`

## Permisos por Rol

| Accion | Admin | Supervisor | Digitador | Consultor |
|--------|-------|------------|-----------|-----------|
| Crear | Si | Si | Si | No |
| Editar | Si | Si | Propio | No |
| Aprobar | Si | Si | No | No |
| Eliminar | Si | No | No | No |
| Ver todos | Si | Si | Area | No |

## Validaciones

- Titulo: 3-200 caracteres
- Archivo: Max 10MB, solo PDF/PNG/JPG
- Empresa: Requerida
- Fecha vigencia: Requerida para docs con vencimiento
