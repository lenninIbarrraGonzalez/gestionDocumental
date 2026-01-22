'use client'

import { Pencil, Trash2, Clock, User, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PermissionGate } from '@/components/shared/permission-gate'
import { WorkflowActionsPanel } from './workflow-actions-panel'
import { WorkflowTimeline } from './workflow-timeline'
import { MODULES, ACTIONS } from '@/lib/permissions'
import { DOCUMENT_TYPES, STATUS_CONFIG, getStatusBadgeVariant } from '@/lib/constants'
import { formatDate, formatDateTime } from '@/lib/formatters'
import type { Document } from '@/lib/db'
import type { DocumentStatus } from '@/types'

interface DocumentDetailProps {
  document: Document
  onEdit: (document: Document) => void
  onDelete: (document: Document) => void
  onStatusChange: (document: Document, newStatus: string) => void
  onClose: () => void
}

export function DocumentDetail({
  document,
  onEdit,
  onDelete,
  onStatusChange,
  onClose,
}: DocumentDetailProps) {
  const statusConfig = STATUS_CONFIG[document.estado as keyof typeof STATUS_CONFIG]

  const handleWorkflowStatusChange = (updatedDocument: Document, newStatus: DocumentStatus) => {
    onStatusChange(updatedDocument, newStatus)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{document.titulo}</h2>
            {statusConfig && (
              <Badge variant={getStatusBadgeVariant(statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {document.codigo}
          </p>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="detalles" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4 border-b">
          <TabsList>
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>
        </div>

        {/* Detalles Tab */}
        <TabsContent value="detalles" className="flex-1 overflow-auto m-0">
          <div className="p-6 space-y-6">
            {/* Description */}
            {document.descripcion && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Descripcion
                </h3>
                <p className="text-sm">{document.descripcion}</p>
              </div>
            )}

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Tipo
                </div>
                <p className="text-sm font-medium">
                  {DOCUMENT_TYPES[document.tipo as keyof typeof DOCUMENT_TYPES] ||
                    document.tipo}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Version
                </div>
                <p className="text-sm font-medium">v{document.version}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Fecha de creacion
                </div>
                <p className="text-sm font-medium">
                  {formatDateTime(document.fechaCreacion)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Ultima actualizacion
                </div>
                <p className="text-sm font-medium">
                  {formatDateTime(document.fechaActualizacion)}
                </p>
              </div>

              {document.fechaVigencia && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Vigencia
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(document.fechaVigencia)}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Creado por
                </div>
                <p className="text-sm font-medium">{document.creadoPor}</p>
              </div>
            </div>

            <Separator />

            {/* Workflow Actions Panel */}
            <WorkflowActionsPanel
              document={document}
              onStatusChange={handleWorkflowStatusChange}
            />
          </div>
        </TabsContent>

        {/* Historial Tab */}
        <TabsContent value="historial" className="flex-1 overflow-auto m-0">
          <div className="p-6">
            <WorkflowTimeline documentId={document.id} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 p-6 border-t">
        <PermissionGate module={MODULES.DOCUMENTS} action={ACTIONS.DELETE}>
          <Button
            variant="outline"
            onClick={() => onDelete(document)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </PermissionGate>
        <PermissionGate module={MODULES.DOCUMENTS} action={ACTIONS.EDIT}>
          <Button onClick={() => onEdit(document)} aria-label="Editar documento">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
