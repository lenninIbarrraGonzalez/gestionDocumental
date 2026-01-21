'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

const PUBLIC_PATHS = ['/login', '/recuperar-contrasena']

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login')
      return
    }

    // If authenticated and trying to access login page
    if (isAuthenticated && isPublicPath) {
      router.replace('/')
      return
    }

    // If authenticated but role not allowed
    if (isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.rol)) {
        router.replace('/')
        return
      }
    }
  }, [isAuthenticated, pathname, router, allowedRoles, user])

  // Don't render children until auth check is complete
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  if (!isAuthenticated && !isPublicPath) {
    return null
  }

  if (isAuthenticated && isPublicPath) {
    return null
  }

  return <>{children}</>
}
