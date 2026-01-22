'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, XCircle, X } from 'lucide-react'
import type { VigenciaFilter } from '@/hooks/use-document-filters'

interface VigenciaBannerProps {
  vigenciaFilter: VigenciaFilter
  documentCount: number
}

export function VigenciaBanner({ vigenciaFilter, documentCount }: VigenciaBannerProps) {
  if (vigenciaFilter === 'all') {
    return null
  }

  const isExpired = vigenciaFilter === 'vencido'

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${
        isExpired
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
      }`}
    >
      <div className="flex items-center gap-3">
        {isExpired ? (
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        )}
        <div>
          <p
            className={`font-medium ${
              isExpired
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}
          >
            {isExpired
              ? 'Mostrando documentos vencidos'
              : 'Mostrando documentos proximos a vencer (7 dias)'}
          </p>
          <p
            className={`text-sm ${
              isExpired
                ? 'text-red-700 dark:text-red-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}
          >
            {documentCount} documento(s)
          </p>
        </div>
      </div>
      <Link href="/documentos">
        <Button variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          Quitar filtro
        </Button>
      </Link>
    </div>
  )
}
