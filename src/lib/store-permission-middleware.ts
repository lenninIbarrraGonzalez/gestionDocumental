import { useAuthStore } from '@/stores/auth-store'
import { hasPermission, type Module, type Action, MODULES, ACTIONS } from '@/lib/permissions'
import type { UserRole } from '@/types'

/**
 * Error thrown when a user attempts an action without proper permissions
 */
export class PermissionError extends Error {
  constructor(
    public module: Module,
    public action: Action,
    public userRole?: UserRole
  ) {
    const roleText = userRole ? ` (rol: ${userRole})` : ''
    super(`No tiene permisos para ${getActionLabel(action)} en ${getModuleLabel(module)}${roleText}`)
    this.name = 'PermissionError'
  }
}

/**
 * Get user-friendly action label
 */
function getActionLabel(action: Action): string {
  const labels: Record<Action, string> = {
    [ACTIONS.VIEW]: 'ver',
    [ACTIONS.CREATE]: 'crear',
    [ACTIONS.EDIT]: 'editar',
    [ACTIONS.DELETE]: 'eliminar',
    [ACTIONS.APPROVE]: 'aprobar',
  }
  return labels[action] || action
}

/**
 * Get user-friendly module label
 */
function getModuleLabel(module: Module): string {
  const labels: Record<Module, string> = {
    [MODULES.DASHBOARD]: 'el panel de control',
    [MODULES.DOCUMENTS]: 'documentos',
    [MODULES.COMPANIES]: 'empresas',
    [MODULES.WORKERS]: 'trabajadores',
    [MODULES.USERS]: 'usuarios',
    [MODULES.AUDIT]: 'auditoria',
    [MODULES.SETTINGS]: 'configuracion',
  }
  return labels[module] || module
}

/**
 * Get current user's role from auth store
 */
function getCurrentUserRole(): UserRole | undefined {
  const user = useAuthStore.getState().user
  return user?.rol
}

/**
 * Check if current user has permission for an action
 */
export function checkPermission(module: Module, action: Action): boolean {
  const role = getCurrentUserRole()
  return hasPermission(role, module, action)
}

/**
 * Require permission for an action, throwing if not authorized
 */
export function requirePermission(module: Module, action: Action): void {
  const role = getCurrentUserRole()
  if (!hasPermission(role, module, action)) {
    throw new PermissionError(module, action, role)
  }
}

/**
 * Wrapper function that validates permissions before executing a store action
 */
export function withPermission<T extends (...args: unknown[]) => unknown>(
  module: Module,
  action: Action,
  fn: T
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    requirePermission(module, action)
    return fn(...args) as ReturnType<T>
  }) as T
}

/**
 * Async wrapper function that validates permissions before executing a store action
 */
export function withPermissionAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  module: Module,
  action: Action,
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    requirePermission(module, action)
    return await fn(...args) as Awaited<ReturnType<T>>
  }) as T
}

/**
 * Helper to wrap multiple store actions with permission checks
 */
export function createProtectedActions<
  TActions extends Record<string, (...args: unknown[]) => unknown | Promise<unknown>>
>(
  module: Module,
  actions: TActions,
  actionPermissions: Partial<Record<keyof TActions, Action>>
): TActions {
  const protectedActions = {} as TActions

  for (const [key, fn] of Object.entries(actions)) {
    const actionKey = key as keyof TActions
    const permission = actionPermissions[actionKey]

    if (permission) {
      // Wrap with permission check
      if (fn.constructor.name === 'AsyncFunction') {
        protectedActions[actionKey] = withPermissionAsync(
          module,
          permission,
          fn as (...args: unknown[]) => Promise<unknown>
        ) as TActions[keyof TActions]
      } else {
        protectedActions[actionKey] = withPermission(
          module,
          permission,
          fn
        ) as TActions[keyof TActions]
      }
    } else {
      // No permission required for this action
      protectedActions[actionKey] = fn as TActions[keyof TActions]
    }
  }

  return protectedActions
}

/**
 * Configuration for protected CRUD operations
 */
export interface CrudPermissionConfig {
  module: Module
  createAction?: Action
  readAction?: Action
  updateAction?: Action
  deleteAction?: Action
}

/**
 * Default CRUD permission mapping
 */
export const DEFAULT_CRUD_PERMISSIONS: Omit<CrudPermissionConfig, 'module'> = {
  createAction: ACTIONS.CREATE,
  readAction: ACTIONS.VIEW,
  updateAction: ACTIONS.EDIT,
  deleteAction: ACTIONS.DELETE,
}
