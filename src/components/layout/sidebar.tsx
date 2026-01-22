'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { canAccessRoute } from '@/lib/permissions'
import { useAuthStore } from '@/stores/auth-store'
import {
  FileText,
  Building2,
  Users,
  UserCog,
  ClipboardList,
  LayoutDashboard,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Documentos', href: '/documentos', icon: FileText },
  { name: 'Empresas', href: '/empresas', icon: Building2 },
  { name: 'Trabajadores', href: '/trabajadores', icon: Users },
  { name: 'Usuarios', href: '/usuarios', icon: UserCog },
  { name: 'Auditoria', href: '/auditoria', icon: ClipboardList },
  { name: 'Configuracion', href: '/configuracion', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const filteredNav = navigation.filter((item) => {
    return canAccessRoute(user?.rol, item.href)
  })

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span>Gestion Documental</span>
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
