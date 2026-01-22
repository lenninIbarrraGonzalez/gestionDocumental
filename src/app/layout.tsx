import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthGuard } from '@/components/shared/auth-guard'
import { ErrorBoundary } from '@/components/shared/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestion Documental ARL',
  description: 'Sistema de gestion documental para ARL colombiana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthGuard>{children}</AuthGuard>
        </ErrorBoundary>
      </body>
    </html>
  )
}
