'use client'

import { AlertTriangle, XCircle, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDocumentStore } from '@/stores/document-store'

export function ExpirationAlerts() {
  const router = useRouter()
  const [dismissedExpired, setDismissedExpired] = useState(false)
  const [dismissedExpiring, setDismissedExpiring] = useState(false)

  const getExpiredDocuments = useDocumentStore((state) => state.getExpiredDocuments)
  const getExpiringDocuments = useDocumentStore((state) => state.getExpiringDocuments)
  const setFilter = useDocumentStore((state) => state.setFilter)

  const expiredDocs = getExpiredDocuments()
  const expiringDocs = getExpiringDocuments(7)

  const handleViewExpired = () => {
    // Navigate to documents page with filter for expired
    setFilter({ estado: 'vencido' as 'all' })
    router.push('/documentos?vigencia=vencido')
  }

  const handleViewExpiring = () => {
    // Navigate to documents page with filter for expiring
    router.push('/documentos?vigencia=proxima')
  }

  const hasExpiredAlerts = expiredDocs.length > 0 && !dismissedExpired
  const hasExpiringAlerts = expiringDocs.length > 0 && !dismissedExpiring

  if (!hasExpiredAlerts && !hasExpiringAlerts) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Expired Documents Alert */}
      {hasExpiredAlerts && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-200 flex items-center justify-between">
            <span>Documentos Vencidos</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-100"
              onClick={() => setDismissedExpired(true)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar alerta</span>
            </Button>
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            <div className="flex items-center justify-between mt-2">
              <p>
                Hay <strong>{expiredDocs.length}</strong> documento{expiredDocs.length !== 1 ? 's' : ''} con fecha de vigencia vencida.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewExpired}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
              >
                Ver documentos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Expiring Soon Documents Alert */}
      {hasExpiringAlerts && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200 flex items-center justify-between">
            <span>Documentos Proximos a Vencer</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
              onClick={() => setDismissedExpiring(true)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar alerta</span>
            </Button>
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <div className="flex items-center justify-between mt-2">
              <p>
                Hay <strong>{expiringDocs.length}</strong> documento{expiringDocs.length !== 1 ? 's' : ''} que vence{expiringDocs.length !== 1 ? 'n' : ''} en los proximos 7 dias.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewExpiring}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900"
              >
                Ver documentos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
