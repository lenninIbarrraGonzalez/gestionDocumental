'use client'

import { useState } from 'react'
import { useCompanyStore } from '@/stores/company-store'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, Eye, Edit, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Company } from '@/lib/db'

export default function EmpresasPage() {
  const companies = useCompanyStore((state) => state.companies)
  const filter = useCompanyStore((state) => state.filter)
  const setFilter = useCompanyStore((state) => state.setFilter)
  const getFilteredCompanies = useCompanyStore((state) => state.getFilteredCompanies)
  const updateCompany = useCompanyStore((state) => state.updateCompany)

  const [search, setSearch] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Company>>({})

  const filteredCompanies = getFilteredCompanies()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setFilter({ search: value })
  }

  const handleView = (company: Company) => {
    setSelectedCompany(company)
    setIsViewMode(true)
    setIsDialogOpen(true)
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setEditForm(company)
    setIsViewMode(false)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCompany(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (selectedCompany && editForm) {
      await updateCompany(selectedCompany.id, editForm)
      handleCloseDialog()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gestiona las empresas afiliadas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por razon social o NIT..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            {filteredCompanies.length} empresa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIT</TableHead>
                <TableHead>Razon Social</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    {company.nit}-{company.digitoVerificacion}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {company.razonSocial}
                    </div>
                  </TableCell>
                  <TableCell>{company.ciudad}</TableCell>
                  <TableCell>{company.telefono}</TableCell>
                  <TableCell>
                    <Badge variant={company.activa ? 'default' : 'secondary'}>
                      {company.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(company)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay empresas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Detalles de Empresa' : 'Editar Empresa'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'Informacion detallada de la empresa'
                : 'Modifica los datos de la empresa'}
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIT</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedCompany.nit}-{selectedCompany.digitoVerificacion}</p>
                  ) : (
                    <Input
                      value={editForm.nit || ''}
                      onChange={(e) => setEditForm({ ...editForm, nit: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Digito de Verificacion</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedCompany.digitoVerificacion}</p>
                  ) : (
                    <Input
                      value={editForm.digitoVerificacion || ''}
                      onChange={(e) => setEditForm({ ...editForm, digitoVerificacion: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Razon Social</Label>
                {isViewMode ? (
                  <p className="text-sm">{selectedCompany.razonSocial}</p>
                ) : (
                  <Input
                    value={editForm.razonSocial || ''}
                    onChange={(e) => setEditForm({ ...editForm, razonSocial: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Nombre Comercial</Label>
                {isViewMode ? (
                  <p className="text-sm">{selectedCompany.nombreComercial || '-'}</p>
                ) : (
                  <Input
                    value={editForm.nombreComercial || ''}
                    onChange={(e) => setEditForm({ ...editForm, nombreComercial: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Direccion</Label>
                {isViewMode ? (
                  <p className="text-sm">{selectedCompany.direccion}</p>
                ) : (
                  <Input
                    value={editForm.direccion || ''}
                    onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedCompany.ciudad}</p>
                  ) : (
                    <Input
                      value={editForm.ciudad || ''}
                      onChange={(e) => setEditForm({ ...editForm, ciudad: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedCompany.departamento}</p>
                  ) : (
                    <Input
                      value={editForm.departamento || ''}
                      onChange={(e) => setEditForm({ ...editForm, departamento: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefono</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedCompany.telefono}</p>
                  ) : (
                    <Input
                      value={editForm.telefono || ''}
                      onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  {isViewMode ? (
                    <p className="text-sm">{selectedCompany.email}</p>
                  ) : (
                    <Input
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Representante Legal</Label>
                {isViewMode ? (
                  <p className="text-sm">{selectedCompany.representanteLegal}</p>
                ) : (
                  <Input
                    value={editForm.representanteLegal || ''}
                    onChange={(e) => setEditForm({ ...editForm, representanteLegal: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Badge variant={selectedCompany.activa ? 'default' : 'secondary'}>
                  {selectedCompany.activa ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
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
