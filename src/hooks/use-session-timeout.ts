'use client'

import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { SECURITY_CONFIG } from '@/lib/constants'

const ACTIVITY_CHECK_INTERVAL = 60000 // Check every minute

export function useSessionTimeout() {
  const checkSessionTimeout = useAuthStore((state) => state.checkSessionTimeout)
  const updateActivity = useAuthStore((state) => state.updateActivity)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleActivity = useCallback(() => {
    updateActivity()
  }, [updateActivity])

  useEffect(() => {
    if (!isAuthenticated) return

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Set up interval to check session timeout
    const interval = setInterval(() => {
      const timedOut = checkSessionTimeout()
      if (timedOut) {
        // Session timed out, user was logged out
        clearInterval(interval)
      }
    }, ACTIVITY_CHECK_INTERVAL)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(interval)
    }
  }, [isAuthenticated, checkSessionTimeout, handleActivity])

  return {
    sessionTimeoutMs: SECURITY_CONFIG.SESSION_TIMEOUT_MS,
    sessionTimeoutMinutes: SECURITY_CONFIG.SESSION_TIMEOUT_MS / 60000,
  }
}
