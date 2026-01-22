'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { FullPageSpinner } from '@/components/shared/loading-spinner'
import type { UserRole } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

const PUBLIC_PATHS = ['/login', '/recuperar-contrasena']

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isHydrated, setIsHydrated] = useState(false)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

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
  }, [isHydrated, isAuthenticated, pathname, router, allowedRoles, user])

  // Show loading state while hydrating or during redirects
  if (!isHydrated) {
    return <FullPageSpinner />
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Redirect in progress - show loading
  if ((!isAuthenticated && !isPublicPath) || (isAuthenticated && isPublicPath)) {
    return <FullPageSpinner />
  }

  return <>{children}</>
}
