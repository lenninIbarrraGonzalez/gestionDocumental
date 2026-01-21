'use client'

import { Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DOCUMENT_TYPES, STATUS_CONFIG } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import type { Document } from '@/lib/db'
import { cn } from '@/lib/utils'

interface DocumentTableProps {
  documents: Document[]
  onView: (document: Document) => void
  onEdit: (document: Document) => void
  onDelete: (document: Document) => void
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  isLoading?: boolean
  selectedId?: string
}

export function DocumentTable({
  documents,
  onView,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  isLoading = false,
  selectedId,
}: DocumentTableProps) {
  const handleSort = (field: string) => {
    if (!onSort) return
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(field, newDirection)
  }

  const getStatusBadge = (estado: string) => {
    const config = STATUS_CONFIG[estado as keyof typeof STATUS_CONFIG]
    if (!config) return <Badge variant="secondary">{estado}</Badge>

    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      warning: 'secondary',
      destructive: 'destructive',
      default: 'secondary',
      secondary: 'secondary',
      outline: 'outline',
    }

    return (
      <Badge variant={variantMap[config.color] || 'secondary'}>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div data-testid="table-skeleton" className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay documentos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Código</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort('titulo')}
            >
              <div className="flex items-center gap-1">
                Título
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort('fechaCreacion')}
            >
              <div className="flex items-center gap-1">
                Fecha
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              className={cn(selectedId === document.id && 'bg-muted')}
            >
              <TableCell className="font-mono text-sm">
                {document.codigo}
              </TableCell>
              <TableCell className="font-medium">
                {document.titulo}
              </TableCell>
              <TableCell>
                {DOCUMENT_TYPES[document.tipo as keyof typeof DOCUMENT_TYPES] ||
                  document.tipo}
              </TableCell>
              <TableCell>{getStatusBadge(document.estado)}</TableCell>
              <TableCell>
                {formatDate(document.fechaCreacion)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(document)}
                    aria-label="Ver documento"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(document)}
                    aria-label="Editar documento"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(document)}
                    aria-label="Eliminar documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-muted-foreground">
        {documents.length} documento{documents.length !== 1 ? 's' : ''} encontrado{documents.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
