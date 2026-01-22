import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  PermissionError,
  checkPermission,
  requirePermission,
  withPermission,
  withPermissionAsync,
} from './store-permission-middleware'
import { MODULES, ACTIONS } from './permissions'

// Mock auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: null,
    })),
  },
}))

describe('store-permission-middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PermissionError', () => {
    it('should create error with correct message for user with role', () => {
      const error = new PermissionError(MODULES.DOCUMENTS, ACTIONS.CREATE, 'consultor')

      expect(error.name).toBe('PermissionError')
      expect(error.message).toContain('crear')
      expect(error.message).toContain('documentos')
      expect(error.message).toContain('consultor')
      expect(error.module).toBe(MODULES.DOCUMENTS)
      expect(error.action).toBe(ACTIONS.CREATE)
      expect(error.userRole).toBe('consultor')
    })

    it('should create error without role info when role is undefined', () => {
      const error = new PermissionError(MODULES.USERS, ACTIONS.DELETE)

      expect(error.message).toContain('eliminar')
      expect(error.message).toContain('usuarios')
      expect(error.userRole).toBeUndefined()
    })

    it('should create correct label for view action', () => {
      const error = new PermissionError(MODULES.AUDIT, ACTIONS.VIEW, 'digitador')

      expect(error.message).toContain('ver')
    })

    it('should create correct label for edit action', () => {
      const error = new PermissionError(MODULES.COMPANIES, ACTIONS.EDIT, 'supervisor')

      expect(error.message).toContain('editar')
    })

    it('should create correct label for approve action', () => {
      const error = new PermissionError(MODULES.DOCUMENTS, ACTIONS.APPROVE, 'digitador')

      expect(error.message).toContain('aprobar')
    })
  })

  describe('checkPermission', () => {
    it('should return false when user is not authenticated', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: null,
      } as any)

      const result = checkPermission(MODULES.DOCUMENTS, ACTIONS.VIEW)

      expect(result).toBe(false)
    })

    it('should return true when admin has permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'admin' },
      } as any)

      const result = checkPermission(MODULES.USERS, ACTIONS.CREATE)

      expect(result).toBe(true)
    })

    it('should return false when consultor tries to create documents', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'consultor' },
      } as any)

      const result = checkPermission(MODULES.DOCUMENTS, ACTIONS.CREATE)

      expect(result).toBe(false)
    })

    it('should return true when supervisor tries to view documents', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'supervisor' },
      } as any)

      const result = checkPermission(MODULES.DOCUMENTS, ACTIONS.VIEW)

      expect(result).toBe(true)
    })

    it('should return true when supervisor tries to approve documents', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'supervisor' },
      } as any)

      const result = checkPermission(MODULES.DOCUMENTS, ACTIONS.APPROVE)

      expect(result).toBe(true)
    })

    it('should return false when digitador tries to delete documents', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'digitador' },
      } as any)

      const result = checkPermission(MODULES.DOCUMENTS, ACTIONS.DELETE)

      expect(result).toBe(false)
    })
  })

  describe('requirePermission', () => {
    it('should throw PermissionError when user lacks permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'consultor' },
      } as any)

      expect(() => {
        requirePermission(MODULES.DOCUMENTS, ACTIONS.CREATE)
      }).toThrow(PermissionError)
    })

    it('should not throw when user has permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'admin' },
      } as any)

      expect(() => {
        requirePermission(MODULES.DOCUMENTS, ACTIONS.CREATE)
      }).not.toThrow()
    })

    it('should throw when user is not authenticated', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: null,
      } as any)

      expect(() => {
        requirePermission(MODULES.DOCUMENTS, ACTIONS.VIEW)
      }).toThrow(PermissionError)
    })
  })

  describe('withPermission', () => {
    it('should execute function when user has permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'admin' },
      } as any)

      const mockFn = vi.fn().mockReturnValue('result')
      const protectedFn = withPermission(MODULES.DOCUMENTS, ACTIONS.CREATE, mockFn)

      const result = protectedFn('arg1', 'arg2')

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
      expect(result).toBe('result')
    })

    it('should throw PermissionError when user lacks permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'consultor' },
      } as any)

      const mockFn = vi.fn()
      const protectedFn = withPermission(MODULES.DOCUMENTS, ACTIONS.CREATE, mockFn)

      expect(() => protectedFn()).toThrow(PermissionError)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('withPermissionAsync', () => {
    it('should execute async function when user has permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'admin' },
      } as any)

      const mockFn = vi.fn().mockResolvedValue('async result')
      const protectedFn = withPermissionAsync(MODULES.DOCUMENTS, ACTIONS.CREATE, mockFn)

      const result = await protectedFn('arg1')

      expect(mockFn).toHaveBeenCalledWith('arg1')
      expect(result).toBe('async result')
    })

    it('should throw PermissionError when user lacks permission', async () => {
      const { useAuthStore } = await import('@/stores/auth-store')
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: { id: '1', rol: 'consultor' },
      } as any)

      const mockFn = vi.fn().mockResolvedValue('result')
      const protectedFn = withPermissionAsync(MODULES.DOCUMENTS, ACTIONS.DELETE, mockFn)

      await expect(protectedFn()).rejects.toThrow(PermissionError)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('Permission matrix validation', () => {
    describe('admin role', () => {
      beforeEach(async () => {
        const { useAuthStore } = await import('@/stores/auth-store')
        vi.mocked(useAuthStore.getState).mockReturnValue({
          user: { id: '1', rol: 'admin' },
        } as any)
      })

      it('should have full access to documents', () => {
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.CREATE)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.EDIT)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.DELETE)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.APPROVE)).toBe(true)
      })

      it('should have full access to users', () => {
        expect(checkPermission(MODULES.USERS, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.USERS, ACTIONS.CREATE)).toBe(true)
        expect(checkPermission(MODULES.USERS, ACTIONS.EDIT)).toBe(true)
        expect(checkPermission(MODULES.USERS, ACTIONS.DELETE)).toBe(true)
      })
    })

    describe('supervisor role', () => {
      beforeEach(async () => {
        const { useAuthStore } = await import('@/stores/auth-store')
        vi.mocked(useAuthStore.getState).mockReturnValue({
          user: { id: '1', rol: 'supervisor' },
        } as any)
      })

      it('should have view and approve access to documents', () => {
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.APPROVE)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.CREATE)).toBe(false)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.DELETE)).toBe(false)
      })

      it('should not have access to users module', () => {
        expect(checkPermission(MODULES.USERS, ACTIONS.VIEW)).toBe(false)
      })

      it('should have view access to audit', () => {
        expect(checkPermission(MODULES.AUDIT, ACTIONS.VIEW)).toBe(true)
      })
    })

    describe('digitador role', () => {
      beforeEach(async () => {
        const { useAuthStore } = await import('@/stores/auth-store')
        vi.mocked(useAuthStore.getState).mockReturnValue({
          user: { id: '1', rol: 'digitador' },
        } as any)
      })

      it('should have view, create, edit access to documents but not delete', () => {
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.CREATE)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.EDIT)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.DELETE)).toBe(false)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.APPROVE)).toBe(false)
      })

      it('should not have access to users or audit modules', () => {
        expect(checkPermission(MODULES.USERS, ACTIONS.VIEW)).toBe(false)
        expect(checkPermission(MODULES.AUDIT, ACTIONS.VIEW)).toBe(false)
      })
    })

    describe('consultor role', () => {
      beforeEach(async () => {
        const { useAuthStore } = await import('@/stores/auth-store')
        vi.mocked(useAuthStore.getState).mockReturnValue({
          user: { id: '1', rol: 'consultor' },
        } as any)
      })

      it('should have view-only access to documents', () => {
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.CREATE)).toBe(false)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.EDIT)).toBe(false)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.DELETE)).toBe(false)
        expect(checkPermission(MODULES.DOCUMENTS, ACTIONS.APPROVE)).toBe(false)
      })

      it('should have view-only access to companies and workers', () => {
        expect(checkPermission(MODULES.COMPANIES, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.COMPANIES, ACTIONS.CREATE)).toBe(false)
        expect(checkPermission(MODULES.WORKERS, ACTIONS.VIEW)).toBe(true)
        expect(checkPermission(MODULES.WORKERS, ACTIONS.CREATE)).toBe(false)
      })
    })
  })
})
