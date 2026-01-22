import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkflowService } from './workflow-service'
import { DOCUMENT_STATUS } from '@/lib/constants'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    workflowHistory: {
      add: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

describe('WorkflowService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAvailableTransitions', () => {
    it('should return correct transitions for borrador status', () => {
      const transitions = WorkflowService.getAvailableTransitions('borrador')

      expect(transitions).toContain('ENVIAR_REVISION')
      expect(transitions).not.toContain('APROBAR')
    })

    it('should return correct transitions for pendiente_revision status', () => {
      const transitions = WorkflowService.getAvailableTransitions('pendiente_revision')

      expect(transitions).toContain('INICIAR_REVISION')
    })

    it('should return correct transitions for en_revision status', () => {
      const transitions = WorkflowService.getAvailableTransitions('en_revision')

      expect(transitions).toContain('APROBAR')
      expect(transitions).toContain('RECHAZAR')
      expect(transitions).toContain('SOLICITAR_CORRECCION')
    })

    it('should return correct transitions for requiere_correccion status', () => {
      const transitions = WorkflowService.getAvailableTransitions('requiere_correccion')

      expect(transitions).toContain('CORREGIR')
    })

    it('should return correct transitions for aprobado status', () => {
      const transitions = WorkflowService.getAvailableTransitions('aprobado')

      expect(transitions).toContain('ARCHIVAR')
    })

    it('should return empty array for rechazado status', () => {
      const transitions = WorkflowService.getAvailableTransitions('rechazado')

      expect(transitions).toHaveLength(0)
    })
  })

  describe('canTransition', () => {
    it('should return true for valid transition', () => {
      const result = WorkflowService.canTransition('borrador', 'ENVIAR_REVISION')

      expect(result).toBe(true)
    })

    it('should return false for invalid transition', () => {
      const result = WorkflowService.canTransition('borrador', 'APROBAR')

      expect(result).toBe(false)
    })

    it('should return false for unknown status', () => {
      const result = WorkflowService.canTransition('unknown' as any, 'ENVIAR_REVISION')

      expect(result).toBe(false)
    })
  })

  describe('getNextStatus', () => {
    it('should return pendiente_revision for ENVIAR_REVISION action', () => {
      const nextStatus = WorkflowService.getNextStatus('ENVIAR_REVISION')

      expect(nextStatus).toBe(DOCUMENT_STATUS.PENDIENTE_REVISION)
    })

    it('should return en_revision for INICIAR_REVISION action', () => {
      const nextStatus = WorkflowService.getNextStatus('INICIAR_REVISION')

      expect(nextStatus).toBe(DOCUMENT_STATUS.EN_REVISION)
    })

    it('should return aprobado for APROBAR action', () => {
      const nextStatus = WorkflowService.getNextStatus('APROBAR')

      expect(nextStatus).toBe(DOCUMENT_STATUS.APROBADO)
    })

    it('should return rechazado for RECHAZAR action', () => {
      const nextStatus = WorkflowService.getNextStatus('RECHAZAR')

      expect(nextStatus).toBe(DOCUMENT_STATUS.RECHAZADO)
    })

    it('should return requiere_correccion for SOLICITAR_CORRECCION action', () => {
      const nextStatus = WorkflowService.getNextStatus('SOLICITAR_CORRECCION')

      expect(nextStatus).toBe(DOCUMENT_STATUS.REQUIERE_CORRECCION)
    })
  })

  describe('validateTransition', () => {
    it('should return valid for correct transition', () => {
      const result = WorkflowService.validateTransition('borrador', 'ENVIAR_REVISION')

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid with error for incorrect transition', () => {
      const result = WorkflowService.validateTransition('borrador', 'APROBAR')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return invalid for unrecognized status', () => {
      const result = WorkflowService.validateTransition('unknown_status' as any, 'ENVIAR_REVISION')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('no reconocido')
    })
  })

  describe('getActionLabel', () => {
    it('should return Spanish label for known action', () => {
      expect(WorkflowService.getActionLabel('ENVIAR_REVISION')).toBe('Enviar a revisión')
      expect(WorkflowService.getActionLabel('APROBAR')).toBe('Aprobar')
      expect(WorkflowService.getActionLabel('RECHAZAR')).toBe('Rechazar')
    })

    it('should return action itself for unknown action', () => {
      const result = WorkflowService.getActionLabel('UNKNOWN_ACTION' as any)
      expect(result).toBe('UNKNOWN_ACTION')
    })
  })

  describe('executeTransition', () => {
    it('should execute valid transition and save to history', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.workflowHistory.add).mockResolvedValue(undefined as any)

      const record = {
        documentoId: 'doc-1',
        accion: 'ENVIAR_REVISION' as const,
        estadoAnterior: 'borrador' as const,
        estadoNuevo: 'pendiente_revision' as const,
        usuarioId: 'user-1',
        comentario: 'Test comment',
      }

      const result = await WorkflowService.executeTransition(record)

      expect(result.documentoId).toBe('doc-1')
      expect(result.accion).toBe('ENVIAR_REVISION')
      expect(db.workflowHistory.add).toHaveBeenCalled()
    })

    it('should throw error for invalid transition', async () => {
      const record = {
        documentoId: 'doc-1',
        accion: 'APROBAR' as const,
        estadoAnterior: 'borrador' as const,
        estadoNuevo: 'aprobado' as const,
        usuarioId: 'user-1',
      }

      await expect(WorkflowService.executeTransition(record)).rejects.toThrow()
    })
  })

  describe('getDocumentHistory', () => {
    it('should return history for document', async () => {
      const { db } = await import('@/lib/db')
      const mockHistory = [
        { id: '1', documentoId: 'doc-1', accion: 'ENVIAR_REVISION' },
        { id: '2', documentoId: 'doc-1', accion: 'INICIAR_REVISION' },
      ]
      vi.mocked(db.workflowHistory.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockHistory),
        }),
      } as any)

      const result = await WorkflowService.getDocumentHistory('doc-1')

      expect(result).toHaveLength(2)
    })
  })

  describe('getAllActions', () => {
    it('should return all actions with labels', () => {
      const actions = WorkflowService.getAllActions()

      expect(actions).toBeInstanceOf(Array)
      expect(actions.length).toBeGreaterThan(0)
      expect(actions[0]).toHaveProperty('action')
      expect(actions[0]).toHaveProperty('label')
    })
  })

  describe('canEdit', () => {
    it('should return true for borrador status', () => {
      expect(WorkflowService.canEdit('borrador')).toBe(true)
    })

    it('should return true for requiere_correccion status', () => {
      expect(WorkflowService.canEdit('requiere_correccion')).toBe(true)
    })

    it('should return false for aprobado status', () => {
      expect(WorkflowService.canEdit('aprobado')).toBe(false)
    })

    it('should return false for en_revision status', () => {
      expect(WorkflowService.canEdit('en_revision')).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should return true for borrador status', () => {
      expect(WorkflowService.canDelete('borrador')).toBe(true)
    })

    it('should return false for other statuses', () => {
      expect(WorkflowService.canDelete('aprobado')).toBe(false)
      expect(WorkflowService.canDelete('en_revision')).toBe(false)
      expect(WorkflowService.canDelete('rechazado')).toBe(false)
    })
  })

  describe('getAvailableActions', () => {
    it('should return same result as getAvailableTransitions', () => {
      const actions = WorkflowService.getAvailableActions('borrador')
      const transitions = WorkflowService.getAvailableTransitions('borrador')

      expect(actions).toEqual(transitions)
    })
  })

  describe('executeSimpleTransition', () => {
    it('should execute valid transition and return new status', () => {
      const result = WorkflowService.executeSimpleTransition(
        'doc-1',
        'borrador',
        'ENVIAR_REVISION',
        'user-1',
        'Comment'
      )

      expect(result.estadoNuevo).toBe('pendiente_revision')
      expect(result.record.documentoId).toBe('doc-1')
      expect(result.record.accion).toBe('ENVIAR_REVISION')
    })

    it('should throw error for invalid transition', () => {
      expect(() =>
        WorkflowService.executeSimpleTransition(
          'doc-1',
          'borrador',
          'APROBAR',
          'user-1'
        )
      ).toThrow()
    })
  })

  describe('getAvailableTransitions - terminal states', () => {
    it('should return empty array for vencido status', () => {
      const transitions = WorkflowService.getAvailableTransitions('vencido')
      expect(transitions).toHaveLength(0)
    })

    it('should return empty array for archivado status', () => {
      const transitions = WorkflowService.getAvailableTransitions('archivado')
      expect(transitions).toHaveLength(0)
    })

    it('should return empty array for unknown status', () => {
      const transitions = WorkflowService.getAvailableTransitions('unknown' as any)
      expect(transitions).toHaveLength(0)
    })
  })
})
