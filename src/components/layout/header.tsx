'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationStore } from '@/stores/notification-store'
import { useSessionTimeout } from '@/hooks/use-session-timeout'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Bell, LogOut, Menu, User } from 'lucide-react'
import { useSidebarStore } from '@/stores/sidebar-store'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const unreadCount = useNotificationStore((state) => state.getUnreadCount())
  const toggleSidebar = useSidebarStore((state) => state.toggle)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Initialize session timeout monitoring
  useSessionTimeout()

  const initials = user
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : 'U'

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false)
    logout()
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
          <h1 className="text-lg font-semibold">Sistema de Gestion Documental</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user?.rol}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesion</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Esta seguro que desea cerrar su sesion? Debera volver a iniciar sesion para acceder al sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cerrar sesion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
