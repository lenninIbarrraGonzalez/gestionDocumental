import type { UserRole } from '@/types'

// Available modules in the system
export const MODULES = {
  DASHBOARD: 'dashboard',
  DOCUMENTS: 'documents',
  COMPANIES: 'companies',
  WORKERS: 'workers',
  USERS: 'users',
  AUDIT: 'audit',
  SETTINGS: 'settings',
} as const

export type Module = (typeof MODULES)[keyof typeof MODULES]

// Available actions
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]

// Permission matrix by role
// Based on the defined permission matrix:
// | Module       | Admin          | Supervisor          | Digitador           | Consultor    |
// |--------------|----------------|---------------------|---------------------|--------------|
// | Dashboard    | View           | View                | View                | View         |
// | Documents    | CRUD + Delete  | View + Approve      | CRUD (no delete)    | View only    |
// | Companies    | Full CRUD      | View only           | View only           | View only    |
// | Workers      | Full CRUD      | View only           | View only           | View only    |
// | Users        | Full CRUD      | No access           | No access           | No access    |
// | Audit        | View           | View                | No access           | No access    |
// | Settings     | Full           | Own only            | Own only            | Own only     |

type PermissionSet = {
  [key in Module]?: Action[]
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  admin: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.DOCUMENTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.APPROVE],
    [MODULES.COMPANIES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
    [MODULES.WORKERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
    [MODULES.USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
    [MODULES.AUDIT]: [ACTIONS.VIEW],
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT],
  },
  supervisor: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.DOCUMENTS]: [ACTIONS.VIEW, ACTIONS.APPROVE],
    [MODULES.COMPANIES]: [ACTIONS.VIEW],
    [MODULES.WORKERS]: [ACTIONS.VIEW],
    // No access to users module
    [MODULES.AUDIT]: [ACTIONS.VIEW],
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT], // Own settings only
  },
  digitador: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.DOCUMENTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT], // No delete
    [MODULES.COMPANIES]: [ACTIONS.VIEW],
    [MODULES.WORKERS]: [ACTIONS.VIEW],
    // No access to users module
    // No access to audit module
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT], // Own settings only
  },
  consultor: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.DOCUMENTS]: [ACTIONS.VIEW], // View only
    [MODULES.COMPANIES]: [ACTIONS.VIEW],
    [MODULES.WORKERS]: [ACTIONS.VIEW],
    // No access to users module
    // No access to audit module
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT], // Own settings only
  },
}

// Route to module mapping
const ROUTE_MODULE_MAP: Record<string, Module> = {
  '/': MODULES.DASHBOARD,
  '/documentos': MODULES.DOCUMENTS,
  '/empresas': MODULES.COMPANIES,
  '/trabajadores': MODULES.WORKERS,
  '/usuarios': MODULES.USERS,
  '/auditoria': MODULES.AUDIT,
  '/configuracion': MODULES.SETTINGS,
}

/**
 * Check if a role has permission to perform an action on a module
 */
export function hasPermission(
  role: UserRole | undefined,
  module: Module,
  action: Action
): boolean {
  if (!role) return false

  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false

  const modulePermissions = permissions[module]
  if (!modulePermissions) return false

  return modulePermissions.includes(action)
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole | undefined, pathname: string): boolean {
  if (!role) return false

  // Find matching route (handle both exact and prefix matches)
  let targetModule: Module | undefined

  // First try exact match
  if (ROUTE_MODULE_MAP[pathname]) {
    targetModule = ROUTE_MODULE_MAP[pathname]
  } else {
    // Try prefix match for nested routes (e.g., /documentos/nuevo)
    for (const [route, mod] of Object.entries(ROUTE_MODULE_MAP)) {
      if (route !== '/' && pathname.startsWith(route)) {
        targetModule = mod
        break
      }
    }
  }

  // If no module found, default to allowing access (for unknown routes)
  if (!targetModule) return true

  // Check if role has at least view permission for the module
  return hasPermission(role, targetModule, ACTIONS.VIEW)
}

/**
 * Get all allowed routes for a role
 */
export function getAllowedRoutes(role: UserRole | undefined): string[] {
  if (!role) return []

  return Object.entries(ROUTE_MODULE_MAP)
    .filter(([, module]) => hasPermission(role, module, ACTIONS.VIEW))
    .map(([route]) => route)
}

/**
 * Get roles that can access a specific module
 */
export function getRolesForModule(module: Module, action: Action = ACTIONS.VIEW): UserRole[] {
  const roles: UserRole[] = ['admin', 'supervisor', 'digitador', 'consultor']
  return roles.filter((role) => hasPermission(role, module, action))
}
