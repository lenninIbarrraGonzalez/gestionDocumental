'use client'

import { useState } from 'react'
import { useWorkerStore } from '@/stores/worker-store'
import { useCompanyStore } from '@/stores/company-store'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionGate } from '@/components/shared/permission-gate'
import { MODULES, ACTIONS } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, Eye, Edit, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Worker } from '@/lib/db'

export default function TrabajadoresPage() {
  const workers = useWorkerStore((state) => state.workers)
  const filter = useWorkerStore((state) => state.filter)
  const setFilter = useWorkerStore((state) => state.setFilter)
  const getFilteredWorkers = useWorkerStore((state) => state.getFilteredWorkers)
  const updateWorker = useWorkerStore((state) => state.updateWorker)
  const createWorker = useWorkerStore((state) => state.createWorker)
  const companies = useCompanyStore((state) => state.companies)

  const [search, setSearch] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Worker>>({})

  const filteredWorkers = getFilteredWorkers()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setFilter({ search: value })
  }

  const handleCompanyChange = (value: string) => {
    if (value === 'all') {
      setFilter({ empresaId: undefined })
    } else {
      setFilter({ empresaId: value })
    }
  }

  const getCompanyName = (empresaId: string) => {
    const company = companies.find((c) => c.id === empresaId)
    return company?.razonSocial || 'N/A'
  }

  const handleCreate = () => {
    setSelectedWorker(null)
    setEditForm({
      tipoDocumento: 'CC',
      documento: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      cargo: '',
      area: '',
      empresaId: '',
      activo: true,
    })
    setDialogMode('create')
    setIsDialogOpen(true)
  }

  const handleView = (worker: Worker) => {
    setSelectedWorker(worker)
    setDialogMode('view')
    setIsDialogOpen(true)
  }

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker)
    setEditForm(worker)
    setDialogMode('edit')
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedWorker(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (dialogMode === 'create') {
      await createWorker(editForm as Omit<Worker, 'id' | 'fechaCreacion' | 'fechaActualizacion'>)
      handleCloseDialog()
    } else if (selectedWorker && editForm) {
      await updateWorker(selectedWorker.id, editForm)
      handleCloseDialog()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trabajadores</h1>
          <p className="text-muted-foreground">
            Gestiona los trabajadores de las empresas
          </p>
        </div>
        <PermissionGate module={MODULES.WORKERS} action={ACTIONS.CREATE}>
          <Button onClick={handleCreate} size="icon" className="sm:w-auto sm:px-4">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Trabajador</span>
          </Button>
        </PermissionGate>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o documento..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={handleCompanyChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.razonSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Trabajadores</CardTitle>
          <CardDescription>
            {filteredWorkers.length} trabajador(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">
                    {worker.tipoDocumento} {worker.documento}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {worker.nombres} {worker.apellidos}
                    </div>
                  </TableCell>
                  <TableCell>{worker.cargo}</TableCell>
                  <TableCell>{getCompanyName(worker.empresaId)}</TableCell>
                  <TableCell>
                    <Badge variant={worker.activo ? 'default' : 'secondary'}>
                      {worker.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(worker)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <PermissionGate module={MODULES.WORKERS} action={ACTIONS.EDIT}>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWorkers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay trabajadores registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view' ? 'Detalles del Trabajador' : dialogMode === 'create' ? 'Nuevo Trabajador' : 'Editar Trabajador'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'view'
                ? 'Informacion detallada del trabajador'
                : dialogMode === 'create'
                ? 'Ingresa los datos del nuevo trabajador'
                : 'Modifica los datos del trabajador'}
            </DialogDescription>
          </DialogHeader>

          {(selectedWorker || dialogMode === 'create') && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.tipoDocumento}</p>
                  ) : (
                    <Select
                      value={editForm.tipoDocumento || ''}
                      onValueChange={(value) => setEditForm({ ...editForm, tipoDocumento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cedula de Ciudadania</SelectItem>
                        <SelectItem value="CE">Cedula de Extranjeria</SelectItem>
                        <SelectItem value="PA">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Numero de Documento</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.documento}</p>
                  ) : (
                    <Input
                      value={editForm.documento || ''}
                      onChange={(e) => setEditForm({ ...editForm, documento: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombres</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.nombres}</p>
                  ) : (
                    <Input
                      value={editForm.nombres || ''}
                      onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Apellidos</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.apellidos}</p>
                  ) : (
                    <Input
                      value={editForm.apellidos || ''}
                      onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.email || '-'}</p>
                  ) : (
                    <Input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Telefono</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.telefono || '-'}</p>
                  ) : (
                    <Input
                      value={editForm.telefono || ''}
                      onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.cargo}</p>
                  ) : (
                    <Input
                      value={editForm.cargo || ''}
                      onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Area</Label>
                  {dialogMode === 'view' ? (
                    <p className="text-sm">{selectedWorker?.area || '-'}</p>
                  ) : (
                    <Input
                      value={editForm.area || ''}
                      onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                {dialogMode === 'view' ? (
                  <p className="text-sm">{getCompanyName(selectedWorker?.empresaId || '')}</p>
                ) : (
                  <Select
                    value={editForm.empresaId || ''}
                    onValueChange={(value) => setEditForm({ ...editForm, empresaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.razonSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {dialogMode === 'view' && selectedWorker && (
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Badge variant={selectedWorker.activo ? 'default' : 'secondary'}>
                    {selectedWorker.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {dialogMode !== 'view' && (
              <Button onClick={handleSave}>
                {dialogMode === 'create' ? 'Crear Trabajador' : 'Guardar Cambios'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
