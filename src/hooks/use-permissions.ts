'use client'

import { useAuthStore } from '@/stores/auth-store'
import {
  hasPermission,
  canAccessRoute,
  MODULES,
  ACTIONS,
  type Module,
  type Action,
} from '@/lib/permissions'

/**
 * Hook for checking user permissions
 * Provides convenient methods for checking access to modules and actions
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const role = user?.rol

  return {
    /**
     * Check if the user has permission to perform an action on a module
     */
    can: (module: Module, action: Action): boolean => {
      return hasPermission(role, module, action)
    },

    /**
     * Check if the user can access a specific route
     */
    canAccessRoute: (pathname: string): boolean => {
      return canAccessRoute(role, pathname)
    },

    /**
     * Check if the user can view a module
     */
    canView: (module: Module): boolean => {
      return hasPermission(role, module, ACTIONS.VIEW)
    },

    /**
     * Check if the user can create in a module
     */
    canCreate: (module: Module): boolean => {
      return hasPermission(role, module, ACTIONS.CREATE)
    },

    /**
     * Check if the user can edit in a module
     */
    canEdit: (module: Module): boolean => {
      return hasPermission(role, module, ACTIONS.EDIT)
    },

    /**
     * Check if the user can delete in a module
     */
    canDelete: (module: Module): boolean => {
      return hasPermission(role, module, ACTIONS.DELETE)
    },

    /**
     * Check if the user can approve (for documents)
     */
    canApprove: (): boolean => {
      return hasPermission(role, MODULES.DOCUMENTS, ACTIONS.APPROVE)
    },

    /**
     * Get the current user's role
     */
    role,

    /**
     * Check if the user is an admin
     */
    isAdmin: role === 'admin',

    /**
     * Check if the user is a supervisor
     */
    isSupervisor: role === 'supervisor',

    /**
     * Check if the user is a digitador
     */
    isDigitador: role === 'digitador',

    /**
     * Check if the user is a consultor
     */
    isConsultor: role === 'consultor',
  }
}
