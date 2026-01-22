'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { canAccessRoute } from '@/lib/permissions'
import { FullPageSpinner } from '@/components/shared/loading-spinner'
import type { UserRole } from '@/types'

interface PageGuardProps {
  children: React.ReactNode
  /** Specific roles allowed to access this page */
  allowedRoles?: UserRole[]
  /** Route path to check permissions against (if different from current) */
  route?: string
  /** Where to redirect if access is denied */
  redirectTo?: string
}

/**
 * Component that protects a page based on user role permissions
 * Use this at the top level of a page component to restrict access
 *
 * @example
 * ```tsx
 * export default function UsuariosPage() {
 *   return (
 *     <PageGuard allowedRoles={['admin']}>
 *       <PageContent />
 *     </PageGuard>
 *   )
 * }
 * ```
 */
export function PageGuard({
  children,
  allowedRoles,
  route,
  redirectTo = '/',
}: PageGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user) {
      setIsChecking(false)
      return
    }

    let allowed = false

    // If specific roles are provided, check against them
    if (allowedRoles && allowedRoles.length > 0) {
      allowed = allowedRoles.includes(user.rol)
    }
    // Otherwise, check route permission
    else if (route) {
      allowed = canAccessRoute(user.rol, route)
    }
    // If neither is provided, allow access
    else {
      allowed = true
    }

    if (!allowed) {
      router.replace(redirectTo)
    } else {
      setIsAllowed(true)
    }

    setIsChecking(false)
  }, [user, allowedRoles, route, router, redirectTo])

  if (isChecking) {
    return <FullPageSpinner />
  }

  if (!isAllowed) {
    return <FullPageSpinner />
  }

  return <>{children}</>
}
