import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { db, type Notification } from '@/lib/db'
import { generateId } from '@/lib/generators'
import { STORAGE_KEYS } from '@/lib/constants'

type NotificationType =
  | 'document_approved'
  | 'document_rejected'
  | 'document_expiring'
  | 'document_expired'
  | 'document_assigned'
  | 'document_updated'
  | 'system'

interface NotificationState {
  notifications: Notification[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotifications: (usuarioId: string) => Promise<void>
  createNotification: (data: {
    tipo: NotificationType
    titulo: string
    mensaje: string
    usuarioId: string
    entidadTipo?: string
    entidadId?: string
  }) => Promise<Notification>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>

  // Computed
  getUnreadCount: () => number
  getUnreadNotifications: () => Notification[]
  getNotificationsByType: (tipo: NotificationType) => Notification[]
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async (usuarioId: string) => {
    set({ isLoading: true, error: null })
    try {
      const notifications = await db.notifications
        .where('usuarioId')
        .equals(usuarioId)
        .toArray()

      // Sort by date descending
      notifications.sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      )

      set({ notifications, isLoading: false })
    } catch (error) {
      set({ error: 'Error al cargar notificaciones', isLoading: false })
    }
  },

  createNotification: async (data) => {
    const newNotification: Notification = {
      id: generateId(),
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje,
      usuarioId: data.usuarioId,
      leida: false,
      entidadTipo: data.entidadTipo,
      entidadId: data.entidadId,
      fechaCreacion: new Date(),
    }

    await db.notifications.add(newNotification)
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }))

    return newNotification
  },

  markAsRead: async (id: string) => {
    await db.notifications.update(id, { leida: true })
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
    }))
  },

  markAllAsRead: async () => {
    const { notifications } = get()
    const unreadIds = notifications.filter((n) => !n.leida).map((n) => n.id)

    // Update in database
    await Promise.all(
      unreadIds.map((id) => db.notifications.update(id, { leida: true }))
    )

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, leida: true })),
    }))
  },

  deleteNotification: async (id: string) => {
    await db.notifications.delete(id)
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: async () => {
    const { notifications } = get()
    await Promise.all(notifications.map((n) => db.notifications.delete(n.id)))
    set({ notifications: [] })
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.leida).length
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.leida)
  },

  getNotificationsByType: (tipo: NotificationType) => {
    return get().notifications.filter((n) => n.tipo === tipo)
  },
}))

// Helper to create common notification types
export const NotificationHelper = {
  documentApproved: (documentoId: string, documentoTitulo: string, usuarioId: string) => ({
    tipo: 'document_approved' as NotificationType,
    titulo: 'Documento aprobado',
    mensaje: `El documento "${documentoTitulo}" ha sido aprobado.`,
    usuarioId,
    entidadTipo: 'documents',
    entidadId: documentoId,
  }),

  documentRejected: (documentoId: string, documentoTitulo: string, usuarioId: string) => ({
    tipo: 'document_rejected' as NotificationType,
    titulo: 'Documento rechazado',
    mensaje: `El documento "${documentoTitulo}" ha sido rechazado.`,
    usuarioId,
    entidadTipo: 'documents',
    entidadId: documentoId,
  }),

  documentExpiring: (documentoId: string, documentoTitulo: string, usuarioId: string, days: number) => ({
    tipo: 'document_expiring' as NotificationType,
    titulo: 'Documento próximo a vencer',
    mensaje: `El documento "${documentoTitulo}" vencerá en ${days} días.`,
    usuarioId,
    entidadTipo: 'documents',
    entidadId: documentoId,
  }),

  documentExpired: (documentoId: string, documentoTitulo: string, usuarioId: string) => ({
    tipo: 'document_expired' as NotificationType,
    titulo: 'Documento vencido',
    mensaje: `El documento "${documentoTitulo}" ha vencido.`,
    usuarioId,
    entidadTipo: 'documents',
    entidadId: documentoId,
  }),

  documentAssigned: (documentoId: string, documentoTitulo: string, usuarioId: string) => ({
    tipo: 'document_assigned' as NotificationType,
    titulo: 'Documento asignado',
    mensaje: `Se le ha asignado el documento "${documentoTitulo}" para revisión.`,
    usuarioId,
    entidadTipo: 'documents',
    entidadId: documentoId,
  }),
}
