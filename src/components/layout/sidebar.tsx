'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { SidebarNav } from './sidebar-nav'

export function Sidebar() {
  return (
    <aside className="hidden md:fixed md:left-0 md:top-0 md:z-40 md:block md:h-screen md:w-64 md:border-r md:bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span>Gestion Documental</span>
        </Link>
      </div>
      <SidebarNav />
    </aside>
  )
}
