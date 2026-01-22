'use client'

import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useWorkerStore } from '@/stores/worker-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Building2, Users, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const documents = useDocumentStore((state) => state.documents)
  const companies = useCompanyStore((state) => state.companies)
  const workers = useWorkerStore((state) => state.workers)
  const getDocumentsByStatus = useDocumentStore((state) => state.getDocumentsByStatus)
  const getExpiringDocuments = useDocumentStore((state) => state.getExpiringDocuments)

  const stats = [
    {
      title: 'Total Documentos',
      value: documents.length,
      icon: FileText,
      color: 'text-sura-blue',
      bg: 'bg-sura-info-light',
    },
    {
      title: 'Aprobados',
      value: getDocumentsByStatus('aprobado').length,
      icon: CheckCircle,
      color: 'text-sura-success',
      bg: 'bg-sura-success-light',
    },
    {
      title: 'Pendientes',
      value: getDocumentsByStatus('pendiente_revision').length + getDocumentsByStatus('en_revision').length,
      icon: Clock,
      color: 'text-sura-warning',
      bg: 'bg-sura-warning-light',
    },
    {
      title: 'Rechazados',
      value: getDocumentsByStatus('rechazado').length,
      icon: XCircle,
      color: 'text-sura-danger',
      bg: 'bg-sura-danger-light',
    },
  ]

  const expiringDocs = getExpiringDocuments(30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de gestion documental
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">empresas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers.length}</div>
            <p className="text-xs text-muted-foreground">trabajadores registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringDocs.length}</div>
            <p className="text-xs text-muted-foreground">documentos proximos a vencer (30 dias)</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Recientes</CardTitle>
          <CardDescription>Ultimos documentos creados o actualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.titulo}</p>
                    <p className="text-sm text-muted-foreground">{doc.codigo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      doc.estado === 'aprobado'
                        ? 'bg-sura-success-light text-sura-success'
                        : doc.estado === 'rechazado'
                        ? 'bg-sura-danger-light text-sura-danger'
                        : doc.estado === 'borrador'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-sura-warning-light text-sura-warning'
                    }`}
                  >
                    {doc.estado}
                  </span>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay documentos registrados
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
