'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { Header } from '@/components/layout/header'
import { useDocumentStore } from '@/stores/document-store'
import { useCompanyStore } from '@/stores/company-store'
import { useWorkerStore } from '@/stores/worker-store'
import { useUserStore } from '@/stores/user-store'
import { useAuditStore } from '@/stores/audit-store'
import { SeedService } from '@/lib/services/seed-service'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      // Check if data needs to be seeded (handles version changes)
      await SeedService.seedIfVersionChanged()

      // Fetch all data
      useDocumentStore.getState().fetchDocuments()
      useCompanyStore.getState().fetchCompanies()
      useWorkerStore.getState().fetchWorkers()
      useUserStore.getState().fetchUsers()
      useAuditStore.getState().fetchLogs()
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <MobileSidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
