'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionGate } from '@/components/shared/permission-gate'
import { MODULES, ACTIONS } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DocumentDetail } from '@/components/features/documents/document-detail'
import { DocumentForm } from '@/components/features/documents/document-form'
import type { Document } from '@/lib/db'
import type { DocumentStatus, UpdateDocumentDTO } from '@/types'
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
import { Plus, Search, Eye, Edit, FileText, X, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/formatters'
import { STATUS_CONFIG, DOCUMENT_TYPES } from '@/lib/constants'

export default function DocumentosPage() {
  const searchParams = useSearchParams()
  const documents = useDocumentStore((state) => state.documents)
  const filter = useDocumentStore((state) => state.filter)
  const setFilter = useDocumentStore((state) => state.setFilter)
  const getFilteredDocuments = useDocumentStore((state) => state.getFilteredDocuments)
  const getExpiredDocuments = useDocumentStore((state) => state.getExpiredDocuments)
  const getExpiringDocuments = useDocumentStore((state) => state.getExpiringDocuments)
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const deleteDocument = useDocumentStore((state) => state.deleteDocument)
  const changeStatus = useDocumentStore((state) => state.changeStatus)
  const companies = useCompanyStore((state) => state.companies)
  const user = useAuthStore((state) => state.user)

  const [search, setSearch] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vigenciaFilter, setVigenciaFilter] = useState<'all' | 'vencido' | 'proxima'>('all')

  // Handle query params for vigencia filter
  useEffect(() => {
    const vigenciaParam = searchParams.get('vigencia')
    if (vigenciaParam === 'vencido' || vigenciaParam === 'proxima') {
      setVigenciaFilter(vigenciaParam)
    } else {
      setVigenciaFilter('all')
    }
  }, [searchParams])

  // Get filtered documents based on vigencia filter or regular filters
  const getDocumentsForDisplay = () => {
    if (vigenciaFilter === 'vencido') {
      return getExpiredDocuments()
    } else if (vigenciaFilter === 'proxima') {
      return getExpiringDocuments(7)
    }
    return getFilteredDocuments()
  }

  const filteredDocs = getDocumentsForDisplay()

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setFilter({ search: value })
  }

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setFilter({ estado: undefined })
    } else {
      setFilter({ estado: value as DocumentStatus })
    }
  }

  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      setFilter({ tipo: undefined })
    } else {
      setFilter({ tipo: value })
    }
  }

  const getCompanyName = (empresaId: string) => {
    const company = companies.find((c) => c.id === empresaId)
    return company?.razonSocial || 'N/A'
  }

  const handleView = (doc: Document) => {
    setSelectedDocument(doc)
    setDialogMode('view')
  }

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc)
    setDialogMode('edit')
  }

  const handleCloseDialog = () => {
    setSelectedDocument(null)
    setDialogMode(null)
  }

  const handleDelete = async (doc: Document) => {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      await deleteDocument(doc.id)
      handleCloseDialog()
    }
  }

  const handleStatusChangeAction = async (doc: Document, newStatus: string) => {
    if (user) {
      await changeStatus(doc.id, newStatus as DocumentStatus, user.id)
    }
  }

  const handleEditSubmit = async (data: UpdateDocumentDTO) => {
    if (selectedDocument && user) {
      setIsSubmitting(true)
      try {
        await updateDocument(selectedDocument.id, data, user.id)
        handleCloseDialog()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Gestiona los documentos del sistema
          </p>
        </div>
        <PermissionGate module={MODULES.DOCUMENTS} action={ACTIONS.CREATE}>
          <Link href="/documentos/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Documento
            </Button>
          </Link>
        </PermissionGate>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={handleStatusChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleTypeChange} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vigencia Filter Active Banner */}
      {vigenciaFilter !== 'all' && (
        <div className={`flex items-center justify-between rounded-lg border p-4 ${
          vigenciaFilter === 'vencido'
            ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
            : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
        }`}>
          <div className="flex items-center gap-3">
            {vigenciaFilter === 'vencido' ? (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
            <div>
              <p className={`font-medium ${
                vigenciaFilter === 'vencido'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {vigenciaFilter === 'vencido'
                  ? 'Mostrando documentos vencidos'
                  : 'Mostrando documentos proximos a vencer (7 dias)'}
              </p>
              <p className={`text-sm ${
                vigenciaFilter === 'vencido'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {filteredDocs.length} documento(s)
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
      )}

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>
            {filteredDocs.length} documento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Titulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.codigo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.titulo}
                    </div>
                  </TableCell>
                  <TableCell>
                    {DOCUMENT_TYPES[doc.tipo as keyof typeof DOCUMENT_TYPES] || doc.tipo}
                  </TableCell>
                  <TableCell>{getCompanyName(doc.empresaId)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_CONFIG[doc.estado as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_CONFIG[doc.estado as keyof typeof STATUS_CONFIG]?.label || doc.estado}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(doc.fechaCreacion)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <PermissionGate module={MODULES.DOCUMENTS} action={ACTIONS.EDIT}>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No hay documentos que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={dialogMode === 'view'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          {selectedDocument && (
            <DocumentDetail
              document={selectedDocument}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChangeAction}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogMode === 'edit'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          {selectedDocument && (
            <DocumentForm
              initialData={{
                titulo: selectedDocument.titulo,
                descripcion: selectedDocument.descripcion,
                tipo: selectedDocument.tipo,
                empresaId: selectedDocument.empresaId,
                trabajadorId: selectedDocument.trabajadorId,
                fechaVigencia: selectedDocument.fechaVigencia,
              }}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
