'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useSidebarStore } from '@/stores/sidebar-store'
import { SidebarNav } from './sidebar-nav'

export function MobileSidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen)
  const close = useSidebarStore((state) => state.close)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="flex h-16 items-center border-b px-6">
          <SheetTitle asChild>
            <Link href="/" onClick={close} className="flex items-center gap-2 font-semibold">
              <FileText className="h-6 w-6 text-primary" />
              <span>Gestion Documental</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <SidebarNav onNavigate={close} />
      </SheetContent>
    </Sheet>
  )
}
