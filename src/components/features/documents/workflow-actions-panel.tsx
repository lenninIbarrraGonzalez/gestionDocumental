'use client'

import { useState } from 'react'
import { Send, PlayCircle, CheckCircle, XCircle, AlertCircle, FileCheck, Archive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { WorkflowService } from '@/lib/services/workflow-service'
import { useAuthStore } from '@/stores/auth-store'
import { useDocumentStore } from '@/stores/document-store'
import type { Document } from '@/lib/db'
import type { DocumentStatus, WorkflowAction, UserRole } from '@/types'

interface WorkflowActionsPanelProps {
  document: Document
  onStatusChange?: (document: Document, newStatus: DocumentStatus) => void
}

// Action configuration with icons and colors
const ACTION_CONFIG: Record<WorkflowAction, {
  icon: typeof Send
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresComment: boolean
  allowedRoles: UserRole[]
}> = {
  ENVIAR_REVISION: {
    icon: Send,
    variant: 'default',
    requiresComment: false,
    allowedRoles: ['digitador', 'admin'],
  },
  INICIAR_REVISION: {
    icon: PlayCircle,
    variant: 'default',
    requiresComment: false,
    allowedRoles: ['supervisor', 'admin'],
  },
  APROBAR: {
    icon: CheckCircle,
    variant: 'default',
    requiresComment: false,
    allowedRoles: ['supervisor', 'admin'],
  },
  RECHAZAR: {
    icon: XCircle,
    variant: 'destructive',
    requiresComment: true,
    allowedRoles: ['supervisor', 'admin'],
  },
  SOLICITAR_CORRECCION: {
    icon: AlertCircle,
    variant: 'secondary',
    requiresComment: true,
    allowedRoles: ['supervisor', 'admin'],
  },
  CORREGIR: {
    icon: FileCheck,
    variant: 'default',
    requiresComment: false,
    allowedRoles: ['digitador', 'admin'],
  },
  ARCHIVAR: {
    icon: Archive,
    variant: 'outline',
    requiresComment: false,
    allowedRoles: ['supervisor', 'admin'],
  },
}

export function WorkflowActionsPanel({ document, onStatusChange }: WorkflowActionsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = useAuthStore((state) => state.user)
  const changeStatus = useDocumentStore((state) => state.changeStatus)

  // Get available transitions for current document status
  const availableTransitions = WorkflowService.getAvailableTransitions(document.estado as DocumentStatus)

  // Filter transitions based on user role
  const filteredTransitions = availableTransitions.filter((action) => {
    const config = ACTION_CONFIG[action]
    if (!config || !user?.rol) return false
    return config.allowedRoles.includes(user.rol as UserRole)
  })

  const handleActionClick = (action: WorkflowAction) => {
    setSelectedAction(action)
    setComment('')
    setError(null)
    setIsDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedAction || !user) return

    const config = ACTION_CONFIG[selectedAction]

    // Check if comment is required
    if (config.requiresComment && !comment.trim()) {
      setError('El comentario es obligatorio para esta accion')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newStatus = WorkflowService.getNextStatus(selectedAction)

      // Execute transition and record in history
      await WorkflowService.executeTransition({
        documentoId: document.id,
        accion: selectedAction,
        estadoAnterior: document.estado as DocumentStatus,
        estadoNuevo: newStatus,
        usuarioId: user.id,
        comentario: comment.trim() || undefined,
      })

      // Update document status in store
      await changeStatus(document.id, newStatus, user.id)

      // Notify parent component
      if (onStatusChange) {
        onStatusChange({ ...document, estado: newStatus }, newStatus)
      }

      setIsDialogOpen(false)
      setSelectedAction(null)
      setComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar la accion')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if no actions available for user
  if (filteredTransitions.length === 0) {
    return null
  }

  const selectedConfig = selectedAction ? ACTION_CONFIG[selectedAction] : null

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Acciones de Workflow</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredTransitions.map((action) => {
            const config = ACTION_CONFIG[action]
            const Icon = config.icon
            const label = WorkflowService.getActionLabel(action)

            return (
              <Button
                key={action}
                variant={config.variant}
                size="sm"
                onClick={() => handleActionClick(action)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            )
          })}
        </div>
      </div>

      <Separator className="my-4" />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction ? WorkflowService.getActionLabel(selectedAction) : 'Confirmar accion'}
            </DialogTitle>
            <DialogDescription>
              {selectedConfig?.requiresComment
                ? 'Esta accion requiere un comentario obligatorio.'
                : 'Esta a punto de cambiar el estado del documento.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Documento:</span>{' '}
                <span className="font-medium">{document.titulo}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Codigo:</span>{' '}
                <span className="font-mono">{document.codigo}</span>
              </p>
              {selectedAction && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Nuevo estado:</span>{' '}
                  <span className="font-medium">
                    {WorkflowService.getNextStatus(selectedAction)}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">
                Comentario {selectedConfig?.requiresComment && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  selectedConfig?.requiresComment
                    ? 'Ingrese el motivo de esta accion...'
                    : 'Comentario opcional...'
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              variant={selectedConfig?.variant}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
