'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/features/auth'
import { SeedService } from '@/lib/services/seed-service'
import { Badge } from '@/components/ui/badge'

const demoCredentials = [
  { rol: 'Administrador', email: 'admin@arl.com', password: 'Admin123!', color: 'bg-sura-danger-light text-sura-danger' },
  { rol: 'Supervisor', email: 'supervisor@arl.com', password: 'Super123!', color: 'bg-sura-info-light text-sura-blue' },
  { rol: 'Digitador', email: 'digitador@arl.com', password: 'Digit123!', color: 'bg-sura-success-light text-sura-success' },
  { rol: 'Consultor', email: 'consultor@arl.com', password: 'Consul123!', color: 'bg-sura-warning-light text-sura-warning' },
]

export default function LoginPage() {
  const [isReady, setIsReady] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<{email: string, password: string} | null>(null)

  useEffect(() => {
    const initData = async () => {
      await SeedService.seedIfEmpty()
      setIsReady(true)
    }
    initData()
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Gestion Documental ARL</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              defaultEmail={selectedCredentials?.email}
              defaultPassword={selectedCredentials?.password}
            />
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="text-lg">Credenciales de Prueba</CardTitle>
            <CardDescription>
              Usuarios disponibles para demostrar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoCredentials.map((cred) => (
                <div
                  key={cred.email}
                  className="p-3 border rounded-lg space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedCredentials({ email: cred.email, password: cred.password })}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cred.rol}</span>
                    <Badge className={cred.color}>{cred.rol}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">{cred.email}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Password:</span>
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">{cred.password}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
