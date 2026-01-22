'use client'

import { useEffect, useState } from 'react'
import {
  Send,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck,
  Archive,
  Clock,
  User,
  MessageSquare,
  Loader2,
  History
} from 'lucide-react'
import { WorkflowService } from '@/lib/services/workflow-service'
import { formatDateTime } from '@/lib/formatters'
import { STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { WorkflowHistory } from '@/lib/db'
import type { WorkflowAction, DocumentStatus } from '@/types'

interface WorkflowTimelineProps {
  documentId: string
}

// Icon and color configuration for each action
const ACTION_VISUAL_CONFIG: Record<WorkflowAction, {
  icon: typeof Send
  bgColor: string
  iconColor: string
  borderColor: string
}> = {
  ENVIAR_REVISION: {
    icon: Send,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-300',
  },
  INICIAR_REVISION: {
    icon: PlayCircle,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-300',
  },
  APROBAR: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: 'border-green-300',
  },
  RECHAZAR: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-300',
  },
  SOLICITAR_CORRECCION: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-300',
  },
  CORREGIR: {
    icon: FileCheck,
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-300',
  },
  ARCHIVAR: {
    icon: Archive,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-300',
  },
}

export function WorkflowTimeline({ documentId }: WorkflowTimelineProps) {
  const [history, setHistory] = useState<WorkflowHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await WorkflowService.getDocumentHistory(documentId)
        // Sort by timestamp descending (most recent first)
        const sorted = data.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setHistory(sorted)
      } catch (err) {
        setError('Error al cargar el historial')
        console.error('Error loading workflow history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [documentId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No hay historial de transiciones para este documento.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Las acciones de workflow apareceran aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        {history.map((entry, index) => {
          const config = ACTION_VISUAL_CONFIG[entry.accion as WorkflowAction]
          const Icon = config?.icon || History
          const isLast = index === history.length - 1
          const statusLabel = STATUS_CONFIG[entry.estadoNuevo as keyof typeof STATUS_CONFIG]?.label || entry.estadoNuevo
          const prevStatusLabel = STATUS_CONFIG[entry.estadoAnterior as keyof typeof STATUS_CONFIG]?.label || entry.estadoAnterior

          return (
            <div key={entry.id} className="relative flex gap-4 pb-6">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-5 top-10 w-0.5 h-full bg-border -translate-x-1/2" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                  config?.bgColor || 'bg-muted',
                  config?.borderColor || 'border-border'
                )}
              >
                <Icon className={cn('h-5 w-5', config?.iconColor || 'text-muted-foreground')} />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-medium text-sm">
                    {WorkflowService.getActionLabel(entry.accion as WorkflowAction)}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(entry.timestamp)}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span>{prevStatusLabel}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-foreground">{statusLabel}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{entry.usuarioId}</span>
                </div>

                {entry.comentario && (
                  <div className="mt-2 rounded-md bg-muted p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{entry.comentario}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
