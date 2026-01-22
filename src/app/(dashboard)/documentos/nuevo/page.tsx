'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentForm } from '@/components/features/documents/document-form'
import { useDocumentStore } from '@/stores/document-store'
import { useAuthStore } from '@/stores/auth-store'
import type { DocumentFormData } from '@/lib/validations/document'

export default function NuevoDocumentoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createDocument = useDocumentStore((state) => state.createDocument)
  const user = useAuthStore((state) => state.user)

  const handleSubmit = async (data: DocumentFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await createDocument(data, user.id)
      router.push('/documentos')
    } catch (error) {
      console.error('Error al crear documento:', error)
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/documentos')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Documento</h1>
          <p className="text-muted-foreground">
            Crea un nuevo documento en el sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Documento</CardTitle>
          <CardDescription>
            Completa los campos para crear un nuevo documento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
