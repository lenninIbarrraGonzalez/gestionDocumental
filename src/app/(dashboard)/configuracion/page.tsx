'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Database, Download, Upload } from 'lucide-react'
import { db } from '@/lib/db'

export default function ConfiguracionPage() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Obtener todos los datos
      const [documents, companies, workers, users, auditLogs, notifications, workflowHistory] = await Promise.all([
        db.documents.toArray(),
        db.companies.toArray(),
        db.workers.toArray(),
        db.users.toArray(),
        db.auditLogs.toArray(),
        db.notifications.toArray(),
        db.workflowHistory.toArray(),
      ])

      // Excluir passwordHash de usuarios por seguridad
      const usersWithoutPassword = users.map(({ passwordHash, ...user }) => user)

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          documents,
          companies,
          workers,
          users: usersWithoutPassword,
          auditLogs,
          notifications,
          workflowHistory,
        },
      }

      // Crear blob y descargar
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gestion-documental-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al exportar datos:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracion</h1>
        <p className="text-muted-foreground">
          Configuracion general del sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Datos del Sistema
            </CardTitle>
            <CardDescription>
              Gestiona los datos almacenados en el navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exportar Datos</p>
                <p className="text-sm text-muted-foreground">
                  Descarga todos los datos en formato JSON
                </p>
              </div>
              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Importar Datos</p>
                <p className="text-sm text-muted-foreground">
                  Restaura datos desde un archivo JSON
                </p>
              </div>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferencias
            </CardTitle>
            <CardDescription>
              Ajusta las preferencias del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Las preferencias del sistema estaran disponibles proximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
