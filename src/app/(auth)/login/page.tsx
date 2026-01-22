'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/features/auth'
import { SeedService } from '@/lib/services/seed-service'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

// Demo credentials only shown in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

interface DemoCredential {
  rol: string
  email: string
  password: string
  color: string
}

// Demo credentials loaded from environment variables or defaults for development
const getDemoCredentials = (): DemoCredential[] => {
  if (!isDevelopment) return []

  return [
    {
      rol: 'Administrador',
      email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@arl.com',
      password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'Admin123!',
      color: 'bg-sura-danger-light text-sura-danger'
    },
    {
      rol: 'Supervisor',
      email: process.env.NEXT_PUBLIC_DEMO_SUPERVISOR_EMAIL || 'supervisor@arl.com',
      password: process.env.NEXT_PUBLIC_DEMO_SUPERVISOR_PASSWORD || 'Super123!',
      color: 'bg-sura-info-light text-sura-blue'
    },
    {
      rol: 'Digitador',
      email: process.env.NEXT_PUBLIC_DEMO_DIGITADOR_EMAIL || 'digitador@arl.com',
      password: process.env.NEXT_PUBLIC_DEMO_DIGITADOR_PASSWORD || 'Digit123!',
      color: 'bg-sura-success-light text-sura-success'
    },
    {
      rol: 'Consultor',
      email: process.env.NEXT_PUBLIC_DEMO_CONSULTOR_EMAIL || 'consultor@arl.com',
      password: process.env.NEXT_PUBLIC_DEMO_CONSULTOR_PASSWORD || 'Consul123!',
      color: 'bg-sura-warning-light text-sura-warning'
    },
  ]
}

export default function LoginPage() {
  const [isReady, setIsReady] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<{email: string, password: string} | null>(null)
  const demoCredentials = getDemoCredentials()

  useEffect(() => {
    const initData = async () => {
      await SeedService.seedIfVersionChanged()
      setIsReady(true)
    }
    initData()
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className={`w-full ${isDevelopment ? 'max-w-4xl flex flex-col md:flex-row gap-6' : 'max-w-md'}`}>
        <Card className={isDevelopment ? 'w-full md:w-1/2' : 'w-full'}>
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

        {isDevelopment && demoCredentials.length > 0 && (
          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle className="text-lg">Credenciales de Prueba</CardTitle>
              <CardDescription>
                Solo visible en modo desarrollo
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
        )}
      </div>
    </div>
  )
}
