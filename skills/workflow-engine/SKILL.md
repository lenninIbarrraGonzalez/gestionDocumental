# Skill: Workflow Engine

## Maquina de Estados para Documentos

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

type WorkflowAction =
  | 'ENVIAR_REVISION'
  | 'INICIAR_REVISION'
  | 'APROBAR'
  | 'RECHAZAR'
  | 'SOLICITAR_CORRECCION'
  | 'CORREGIR'
  | 'ARCHIVAR';

const transitions: Record<DocumentStatus, Partial<Record<WorkflowAction, DocumentStatus>>> = {
  borrador: {
    ENVIAR_REVISION: 'pendiente_revision',
  },
  pendiente_revision: {
    INICIAR_REVISION: 'en_revision',
  },
  en_revision: {
    APROBAR: 'aprobado',
    RECHAZAR: 'rechazado',
    SOLICITAR_CORRECCION: 'requiere_correccion',
  },
  requiere_correccion: {
    CORREGIR: 'borrador',
  },
  aprobado: {
    ARCHIVAR: 'archivado',
  },
  rechazado: {},
  vencido: {},
  archivado: {},
};
```

## Servicio de Workflow

```typescript
interface WorkflowResult {
  success: boolean;
  newStatus?: DocumentStatus;
  error?: string;
}

interface WorkflowHistoryEntry {
  id: string;
  documentId: string;
  action: WorkflowAction;
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  userId: string;
  comment?: string;
  timestamp: Date;
}

class WorkflowService {
  canTransition(currentStatus: DocumentStatus, action: WorkflowAction): boolean {
    return transitions[currentStatus]?.[action] !== undefined;
  }

  getAvailableActions(status: DocumentStatus, userRole: string): WorkflowAction[] {
    const statusTransitions = transitions[status] || {};
    return Object.keys(statusTransitions).filter(
      action => this.hasPermission(action as WorkflowAction, userRole)
    ) as WorkflowAction[];
  }

  async executeTransition(
    document: Document,
    action: WorkflowAction,
    userId: string,
    comment?: string
  ): Promise<WorkflowResult> {
    if (!this.canTransition(document.status, action)) {
      return { success: false, error: 'Transicion no permitida' };
    }

    const newStatus = transitions[document.status][action]!;

    // Registrar en historial
    await this.recordHistory({
      documentId: document.id,
      action,
      fromStatus: document.status,
      toStatus: newStatus,
      userId,
      comment,
      timestamp: new Date(),
    });

    return { success: true, newStatus };
  }

  private hasPermission(action: WorkflowAction, role: string): boolean {
    const permissions: Record<WorkflowAction, string[]> = {
      ENVIAR_REVISION: ['admin', 'supervisor', 'digitador'],
      INICIAR_REVISION: ['admin', 'supervisor'],
      APROBAR: ['admin', 'supervisor'],
      RECHAZAR: ['admin', 'supervisor'],
      SOLICITAR_CORRECCION: ['admin', 'supervisor'],
      CORREGIR: ['admin', 'supervisor', 'digitador'],
      ARCHIVAR: ['admin'],
    };
    return permissions[action]?.includes(role) ?? false;
  }
}
```

## Registro de Auditoria

```typescript
interface AuditLog {
  id: string;
  entityType: 'document' | 'user' | 'company' | 'worker';
  entityId: string;
  action: string;
  changes?: Record<string, { before: any; after: any }>;
  userId: string;
  userEmail: string;
  timestamp: Date;
  ipAddress?: string;
}

const auditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  STATUS_CHANGE: 'STATUS_CHANGE',
  EXPORT: 'EXPORT',
} as const;
```

## Validaciones Pre-Transicion

```typescript
interface ValidationRule {
  validate: (document: Document) => boolean;
  message: string;
}

const preTransitionValidations: Record<WorkflowAction, ValidationRule[]> = {
  ENVIAR_REVISION: [
    {
      validate: (doc) => !!doc.archivoUrl,
      message: 'El documento debe tener un archivo adjunto',
    },
    {
      validate: (doc) => doc.titulo.length >= 3,
      message: 'El titulo debe tener al menos 3 caracteres',
    },
  ],
  APROBAR: [
    {
      validate: (doc) => !!doc.revisorId,
      message: 'Debe tener un revisor asignado',
    },
  ],
  // ...
};
```

## Notificaciones de Workflow

```typescript
const workflowNotifications: Record<WorkflowAction, NotificationConfig> = {
  ENVIAR_REVISION: {
    recipients: ['supervisores'],
    title: 'Nuevo documento para revision',
    template: 'El documento {{codigo}} requiere su revision',
  },
  APROBAR: {
    recipients: ['creador'],
    title: 'Documento aprobado',
    template: 'Su documento {{codigo}} ha sido aprobado',
  },
  RECHAZAR: {
    recipients: ['creador'],
    title: 'Documento rechazado',
    template: 'Su documento {{codigo}} ha sido rechazado: {{motivo}}',
  },
};
```
