import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useNotificationStore, NotificationHelper } from './notification-store'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    notifications: {
      toArray: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
      bulkUpdate: vi.fn(),
    },
  },
}))

describe('NotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useNotificationStore.getState()

      expect(state.notifications).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', leida: false },
          { id: '2', leida: true },
          { id: '3', leida: false },
        ] as any,
      })

      const count = useNotificationStore.getState().getUnreadCount()

      expect(count).toBe(2)
    })

    it('should return 0 when all notifications are read', () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', leida: true },
          { id: '2', leida: true },
        ] as any,
      })

      const count = useNotificationStore.getState().getUnreadCount()

      expect(count).toBe(0)
    })
  })

  describe('getUnreadNotifications', () => {
    it('should return only unread notifications', () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', leida: false },
          { id: '2', leida: true },
          { id: '3', leida: false },
        ] as any,
      })

      const unread = useNotificationStore.getState().getUnreadNotifications()

      expect(unread).toHaveLength(2)
      expect(unread.every((n) => n.leida === false)).toBe(true)
    })
  })

  describe('getNotificationsByType', () => {
    it('should return notifications filtered by type', () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', tipo: 'document_approved' },
          { id: '2', tipo: 'document_rejected' },
          { id: '3', tipo: 'document_approved' },
        ] as any,
      })

      const filtered = useNotificationStore
        .getState()
        .getNotificationsByType('document_approved')

      expect(filtered).toHaveLength(2)
      expect(filtered.every((n) => n.tipo === 'document_approved')).toBe(true)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', leida: false },
          { id: '2', leida: false },
        ] as any,
      })

      await act(async () => {
        await useNotificationStore.getState().markAsRead('1')
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications.find((n) => n.id === '1')?.leida).toBe(true)
      expect(notifications.find((n) => n.id === '2')?.leida).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', leida: false },
          { id: '2', leida: false },
          { id: '3', leida: false },
        ] as any,
      })

      await act(async () => {
        await useNotificationStore.getState().markAllAsRead()
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications.every((n) => n.leida === true)).toBe(true)
    })
  })

  describe('deleteNotification', () => {
    it('should remove notification from list', async () => {
      useNotificationStore.setState({
        notifications: [
          { id: '1', titulo: 'Notification 1' },
          { id: '2', titulo: 'Notification 2' },
        ] as any,
      })

      await act(async () => {
        await useNotificationStore.getState().deleteNotification('1')
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications).toHaveLength(1)
      expect(notifications[0].id).toBe('2')
    })
  })

  describe('fetchNotifications', () => {
    it('should fetch notifications from database', async () => {
      const { db } = await import('@/lib/db')
      const mockNotifications = [
        { id: '1', titulo: 'Notification 1', usuarioId: 'user-1' },
        { id: '2', titulo: 'Notification 2', usuarioId: 'user-1' },
      ]
      vi.mocked(db.notifications.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockNotifications),
        }),
      } as any)

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications('user-1')
      })

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(2)
      expect(state.isLoading).toBe(false)
    })

    it('should set error on fetch failure', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.notifications.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error('DB error')),
        }),
      } as any)

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications('user-1')
      })

      const state = useNotificationStore.getState()
      expect(state.error).toBe('Error al cargar notificaciones')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.notifications.add).mockResolvedValue(undefined as any)

      let result: any
      await act(async () => {
        result = await useNotificationStore.getState().createNotification({
          tipo: 'document_approved',
          titulo: 'Test Notification',
          mensaje: 'This is a test',
          usuarioId: 'user-1',
        })
      })

      expect(result.titulo).toBe('Test Notification')
      expect(result.id).toBeDefined()
      expect(result.leida).toBe(false)
      expect(useNotificationStore.getState().notifications).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('should clear all notifications', async () => {
      const { db } = await import('@/lib/db')
      vi.mocked(db.notifications.delete).mockResolvedValue(undefined)

      useNotificationStore.setState({
        notifications: [
          { id: '1', titulo: 'Notification 1' },
          { id: '2', titulo: 'Notification 2' },
        ] as any,
      })

      await act(async () => {
        await useNotificationStore.getState().clearAll()
      })

      expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })
  })

  describe('NotificationHelper', () => {
    it('should create document approved notification data', () => {
      const data = NotificationHelper.documentApproved('doc-1', 'Test Document', 'user-1')

      expect(data.tipo).toBe('document_approved')
      expect(data.titulo).toBe('Documento aprobado')
      expect(data.entidadId).toBe('doc-1')
    })

    it('should create document rejected notification data', () => {
      const data = NotificationHelper.documentRejected('doc-1', 'Test Document', 'user-1')

      expect(data.tipo).toBe('document_rejected')
      expect(data.titulo).toBe('Documento rechazado')
    })

    it('should create document expiring notification data', () => {
      const data = NotificationHelper.documentExpiring('doc-1', 'Test Document', 'user-1', 15)

      expect(data.tipo).toBe('document_expiring')
      expect(data.mensaje).toContain('15 días')
    })

    it('should create document expired notification data', () => {
      const data = NotificationHelper.documentExpired('doc-1', 'Test Document', 'user-1')

      expect(data.tipo).toBe('document_expired')
      expect(data.titulo).toBe('Documento vencido')
    })

    it('should create document assigned notification data', () => {
      const data = NotificationHelper.documentAssigned('doc-1', 'Test Document', 'user-1')

      expect(data.tipo).toBe('document_assigned')
      expect(data.titulo).toBe('Documento asignado')
    })
  })
})
