import { db, type WorkflowHistory } from '@/lib/db'
import { DOCUMENT_STATUS, WORKFLOW_ACTIONS } from '@/lib/constants'
import { generateId } from '@/lib/generators'
import type { DocumentStatus, WorkflowAction } from '@/types'

// Define valid transitions for each status
const VALID_TRANSITIONS: Record<DocumentStatus, WorkflowAction[]> = {
  borrador: ['ENVIAR_REVISION'],
  pendiente_revision: ['INICIAR_REVISION'],
  en_revision: ['APROBAR', 'RECHAZAR', 'SOLICITAR_CORRECCION'],
  requiere_correccion: ['CORREGIR'],
  aprobado: ['ARCHIVAR'],
  rechazado: [],
  vencido: [],
  archivado: [],
}

// Define the resulting status for each action
const ACTION_RESULTS: Record<WorkflowAction, DocumentStatus> = {
  ENVIAR_REVISION: 'pendiente_revision',
  INICIAR_REVISION: 'en_revision',
  APROBAR: 'aprobado',
  RECHAZAR: 'rechazado',
  SOLICITAR_CORRECCION: 'requiere_correccion',
  CORREGIR: 'pendiente_revision',
  ARCHIVAR: 'archivado',
}

// Action labels in Spanish
const ACTION_LABELS: Record<WorkflowAction, string> = {
  ENVIAR_REVISION: 'Enviar a revisión',
  INICIAR_REVISION: 'Iniciar revisión',
  APROBAR: 'Aprobar',
  RECHAZAR: 'Rechazar',
  SOLICITAR_CORRECCION: 'Solicitar corrección',
  CORREGIR: 'Corregir',
  ARCHIVAR: 'Archivar',
}

interface TransitionResult {
  valid: boolean
  error?: string
}

export interface TransitionRecord {
  documentoId: string
  accion: WorkflowAction
  estadoAnterior: DocumentStatus
  estadoNuevo: DocumentStatus
  usuarioId: string
  comentario?: string
}

export class WorkflowService {
  /**
   * Get available workflow transitions for a given document status
   */
  static getAvailableTransitions(status: DocumentStatus): WorkflowAction[] {
    return VALID_TRANSITIONS[status] || []
  }

  /**
   * Check if a transition is valid for a given status
   */
  static canTransition(currentStatus: DocumentStatus, action: WorkflowAction): boolean {
    const validActions = VALID_TRANSITIONS[currentStatus]
    if (!validActions) return false
    return validActions.includes(action)
  }

  /**
   * Get the resulting status after performing an action
   */
  static getNextStatus(action: WorkflowAction): DocumentStatus {
    return ACTION_RESULTS[action]
  }

  /**
   * Get human-readable label for an action
   */
  static getActionLabel(action: WorkflowAction): string {
    return ACTION_LABELS[action] || action
  }

  /**
   * Validate a transition and return detailed result
   */
  static validateTransition(
    currentStatus: DocumentStatus,
    action: WorkflowAction
  ): TransitionResult {
    const validActions = VALID_TRANSITIONS[currentStatus]

    if (!validActions) {
      return {
        valid: false,
        error: `Estado "${currentStatus}" no reconocido`,
      }
    }

    if (!validActions.includes(action)) {
      return {
        valid: false,
        error: `La acción "${this.getActionLabel(action)}" no es válida para el estado actual`,
      }
    }

    return { valid: true }
  }

  /**
   * Execute a workflow transition and record it in history
   */
  static async executeTransition(record: TransitionRecord): Promise<WorkflowHistory> {
    const validation = this.validateTransition(record.estadoAnterior, record.accion)

    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const historyEntry: WorkflowHistory = {
      id: generateId(),
      documentoId: record.documentoId,
      accion: record.accion,
      estadoAnterior: record.estadoAnterior,
      estadoNuevo: record.estadoNuevo,
      usuarioId: record.usuarioId,
      comentario: record.comentario,
      timestamp: new Date(),
    }

    await db.workflowHistory.add(historyEntry)

    return historyEntry
  }

  /**
   * Get workflow history for a document
   */
  static async getDocumentHistory(documentoId: string): Promise<WorkflowHistory[]> {
    return db.workflowHistory.where('documentoId').equals(documentoId).toArray()
  }

  /**
   * Get all available actions with their labels
   */
  static getAllActions(): Array<{ action: WorkflowAction; label: string }> {
    return Object.entries(ACTION_LABELS).map(([action, label]) => ({
      action: action as WorkflowAction,
      label,
    }))
  }

  /**
   * Check if a document can be edited in its current status
   */
  static canEdit(status: DocumentStatus): boolean {
    return status === 'borrador' || status === 'requiere_correccion'
  }

  /**
   * Check if a document can be deleted in its current status
   */
  static canDelete(status: DocumentStatus): boolean {
    return status === 'borrador'
  }

  /**
   * Get available actions for a given status (alias for getAvailableTransitions)
   */
  static getAvailableActions(status: DocumentStatus): WorkflowAction[] {
    return this.getAvailableTransitions(status)
  }

  /**
   * Simplified transition execution - validates and returns the new status
   * Use this for simpler cases where you don't need to record history
   */
  static executeSimpleTransition(
    documentoId: string,
    estadoAnterior: DocumentStatus,
    accion: WorkflowAction,
    usuarioId: string,
    comentario?: string
  ): { estadoNuevo: DocumentStatus; record: TransitionRecord } {
    const validation = this.validateTransition(estadoAnterior, accion)

    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const estadoNuevo = this.getNextStatus(accion)

    return {
      estadoNuevo,
      record: {
        documentoId,
        accion,
        estadoAnterior,
        estadoNuevo,
        usuarioId,
        comentario,
      },
    }
  }
}
