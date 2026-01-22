'use client'

import { usePermissions } from '@/hooks/use-permissions'
import type { Module, Action } from '@/lib/permissions'

interface PermissionGateProps {
  /** The module to check permission for */
  module: Module
  /** The action to check permission for */
  action: Action
  /** Children to render if permission is granted */
  children: React.ReactNode
  /** Optional fallback to render if permission is denied */
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * ```tsx
 * <PermissionGate module={MODULES.DOCUMENTS} action={ACTIONS.DELETE}>
 *   <Button onClick={handleDelete}>Delete</Button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissions()

  if (!can(module, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RequireRoleProps {
  /** Roles that are allowed to see the content */
  roles: string[]
  /** Children to render if role matches */
  children: React.ReactNode
  /** Optional fallback to render if role doesn't match */
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user role
 *
 * @example
 * ```tsx
 * <RequireRole roles={['admin', 'supervisor']}>
 *   <AdminPanel />
 * </RequireRole>
 * ```
 */
export function RequireRole({
  roles,
  children,
  fallback = null,
}: RequireRoleProps) {
  const { role } = usePermissions()

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
