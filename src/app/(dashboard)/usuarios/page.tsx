'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/user-store'
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
import { Plus, Eye, Edit, UserCog, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/formatters'
import type { UserRole } from '@/types'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  digitador: 'Digitador',
  consultor: 'Consultor',
}

type UserWithoutHash = {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: UserRole
  activo: boolean
  ultimoAcceso?: Date
  fechaCreacion: Date
  fechaActualizacion: Date
}

export default function UsuariosPage() {
  const users = useUserStore((state) => state.users)
  const filter = useUserStore((state) => state.filter)
  const setFilter = useUserStore((state) => state.setFilter)
  const getFilteredUsers = useUserStore((state) => state.getFilteredUsers)
  const updateUser = useUserStore((state) => state.updateUser)

  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithoutHash | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserWithoutHash>>({})

  const filteredUsers = getFilteredUsers()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setFilter({ search: value })
  }

  const handleRoleChange = (value: string) => {
    if (value === 'all') {
      setFilter({ rol: undefined })
    } else {
      setFilter({ rol: value as UserRole })
    }
  }

  const handleView = (user: UserWithoutHash) => {
    setSelectedUser(user)
    setIsViewMode(true)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: UserWithoutHash) => {
    setSelectedUser(user)
    setEditForm(user)
    setIsViewMode(false)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedUser(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (selectedUser && editForm) {
      await updateUser(selectedUser.id, editForm)
      handleCloseDialog()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
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
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={handleRoleChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuario(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creacion</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      {user.nombre} {user.apellido}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {roleLabels[user.rol] || user.rol}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.activo ? 'default' : 'secondary'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.fechaCreacion)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(user)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Detalles del Usuario' : 'Editar Usuario'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'Informacion detallada del usuario'
                : 'Modifica los datos del usuario'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedUser.nombre}</p>
                  ) : (
                    <Input
                      value={editForm.nombre || ''}
                      onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedUser.apellido}</p>
                  ) : (
                    <Input
                      value={editForm.apellido || ''}
                      onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                {isViewMode ? (
                  <p className="text-sm">{selectedUser.email}</p>
                ) : (
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                {isViewMode ? (
                  <Badge variant="outline">
                    {roleLabels[selectedUser.rol] || selectedUser.rol}
                  </Badge>
                ) : (
                  <Select
                    value={editForm.rol || ''}
                    onValueChange={(value) => setEditForm({ ...editForm, rol: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Badge variant={selectedUser.activo ? 'default' : 'secondary'}>
                  {selectedUser.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Creacion</Label>
                <p className="text-sm">{formatDate(selectedUser.fechaCreacion)}</p>
              </div>

              {selectedUser.ultimoAcceso && (
                <div className="space-y-2">
                  <Label>Ultimo Acceso</Label>
                  <p className="text-sm">{formatDate(selectedUser.ultimoAcceso)}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSave}>
                Guardar Cambios
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
