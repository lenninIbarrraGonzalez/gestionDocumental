'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useAuthStore } from '@/stores/auth-store'
import { useDocumentFilters } from '@/hooks/use-document-filters'
import { PermissionGate } from '@/components/shared/permission-gate'
import { MODULES, ACTIONS } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DocumentDetail } from '@/components/features/documents/document-detail'
import { DocumentForm } from '@/components/features/documents/document-form'
import { DocumentFilters } from '@/components/features/documents/document-filters'
import { VigenciaBanner } from '@/components/features/documents/vigencia-banner'
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
import { Plus, Eye, Edit, FileText } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import { STATUS_CONFIG, DOCUMENT_TYPES } from '@/lib/constants'

export default function DocumentosPage() {
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const deleteDocument = useDocumentStore((state) => state.deleteDocument)
  const changeStatus = useDocumentStore((state) => state.changeStatus)
  const companies = useCompanyStore((state) => state.companies)
  const user = useAuthStore((state) => state.user)

  const {
    search,
    vigenciaFilter,
    filteredDocs,
    handleSearchChange,
    handleStatusChange,
    handleTypeChange,
  } = useDocumentFilters()

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (confirm('¿Estas seguro de eliminar este documento?')) {
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

      <DocumentFilters
        search={search}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
      />

      <VigenciaBanner
        vigenciaFilter={vigenciaFilter}
        documentCount={filteredDocs.length}
      />

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
