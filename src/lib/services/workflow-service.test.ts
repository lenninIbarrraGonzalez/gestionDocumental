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
  })
})
