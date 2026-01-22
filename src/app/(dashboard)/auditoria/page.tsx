'use client'

import { useAuditStore } from '@/stores/audit-store'
import { PageGuard } from '@/components/shared/page-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClipboardList } from 'lucide-react'
import { formatDateTime } from '@/lib/formatters'

const actionLabels: Record<string, string> = {
  CREATE: 'Crear',
  UPDATE: 'Actualizar',
  DELETE: 'Eliminar',
  VIEW: 'Ver',
  LOGIN: 'Iniciar sesion',
  LOGOUT: 'Cerrar sesion',
  STATUS_CHANGE: 'Cambiar estado',
  EXPORT: 'Exportar',
}

const entityLabels: Record<string, string> = {
  documents: 'Documento',
  companies: 'Empresa',
  workers: 'Trabajador',
  users: 'Usuario',
}

export default function AuditoriaPage() {
  const logs = useAuditStore((state) => state.logs)
  const filter = useAuditStore((state) => state.filter)
  const setFilter = useAuditStore((state) => state.setFilter)
  const getFilteredLogs = useAuditStore((state) => state.getFilteredLogs)
  const getPaginatedLogs = useAuditStore((state) => state.getPaginatedLogs)

  const filteredLogs = getFilteredLogs()
  const paginatedLogs = getPaginatedLogs()

  const handleActionChange = (value: string) => {
    if (value === 'all') {
      setFilter({ accion: undefined })
    } else {
      setFilter({ accion: value as any })
    }
  }

  const handleEntityChange = (value: string) => {
    if (value === 'all') {
      setFilter({ entidad: undefined })
    } else {
      setFilter({ entidad: value })
    }
  }

  return (
    <PageGuard allowedRoles={['admin', 'supervisor']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
          <p className="text-muted-foreground">
            Registro de todas las acciones realizadas en el sistema
          </p>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select onValueChange={handleActionChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Accion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleEntityChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {Object.entries(entityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
          <CardDescription>
            {filteredLogs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Accion</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Descripcion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {formatDateTime(log.timestamp)}
                  </TableCell>
                  <TableCell>{log.usuarioEmail}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {actionLabels[log.accion] || log.accion}
                    </span>
                  </TableCell>
                  <TableCell>
                    {entityLabels[log.entidad] || log.entidad}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.descripcion || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      No hay registros de auditoria
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </PageGuard>
  )
}
