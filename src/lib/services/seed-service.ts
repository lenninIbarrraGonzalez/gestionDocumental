import { db } from '@/lib/db'
import { seedData } from '@/data/seed'
import { SEED_VERSION, STORAGE_KEYS } from '@/lib/constants'

export class SeedService {
  /**
   * Check if database is already seeded
   */
  static async isSeeded(): Promise<boolean> {
    const userCount = await db.users.count()
    return userCount > 0
  }

  /**
   * Seed all data into the database
   */
  static async seedAll(): Promise<void> {
    // Clear existing data first
    await this.clearAll()

    // Seed in order (respecting foreign key relationships)
    await db.users.bulkAdd(seedData.users)
    await db.companies.bulkAdd(seedData.companies)
    await db.workers.bulkAdd(seedData.workers)
    await db.documents.bulkAdd(seedData.documents)
    await db.auditLogs.bulkAdd(seedData.auditLogs)
    await db.notifications.bulkAdd(seedData.notifications)
  }

  /**
   * Seed only if database is empty
   */
  static async seedIfEmpty(): Promise<boolean> {
    const isSeeded = await this.isSeeded()
    if (!isSeeded) {
      await this.seedAll()
      return true
    }
    return false
  }

  /**
   * Clear all data from database
   */
  static async clearAll(): Promise<void> {
    await db.notifications.clear()
    await db.auditLogs.clear()
    await db.workflowHistory.clear()
    await db.documents.clear()
    await db.workers.clear()
    await db.companies.clear()
    await db.users.clear()
  }

  /**
   * Seed specific entity
   */
  static async seedUsers(): Promise<void> {
    await db.users.bulkAdd(seedData.users)
  }

  static async seedCompanies(): Promise<void> {
    await db.companies.bulkAdd(seedData.companies)
  }

  static async seedWorkers(): Promise<void> {
    await db.workers.bulkAdd(seedData.workers)
  }

  static async seedDocuments(): Promise<void> {
    await db.documents.bulkAdd(seedData.documents)
  }

  static async seedAuditLogs(): Promise<void> {
    await db.auditLogs.bulkAdd(seedData.auditLogs)
  }

  static async seedNotifications(): Promise<void> {
    await db.notifications.bulkAdd(seedData.notifications)
  }

  /**
   * Get counts of all entities
   */
  static async getCounts(): Promise<Record<string, number>> {
    return {
      users: await db.users.count(),
      companies: await db.companies.count(),
      workers: await db.workers.count(),
      documents: await db.documents.count(),
      auditLogs: await db.auditLogs.count(),
      notifications: await db.notifications.count(),
    }
  }

  /**
   * Export all data as JSON (for backup)
   */
  static async exportAll(): Promise<string> {
    const data = {
      users: await db.users.toArray(),
      companies: await db.companies.toArray(),
      workers: await db.workers.toArray(),
      documents: await db.documents.toArray(),
      auditLogs: await db.auditLogs.toArray(),
      notifications: await db.notifications.toArray(),
      workflowHistory: await db.workflowHistory.toArray(),
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * Import data from JSON backup
   */
  static async importAll(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData)

    await this.clearAll()

    if (data.users) await db.users.bulkAdd(data.users)
    if (data.companies) await db.companies.bulkAdd(data.companies)
    if (data.workers) await db.workers.bulkAdd(data.workers)
    if (data.documents) await db.documents.bulkAdd(data.documents)
    if (data.auditLogs) await db.auditLogs.bulkAdd(data.auditLogs)
    if (data.notifications) await db.notifications.bulkAdd(data.notifications)
    if (data.workflowHistory) await db.workflowHistory.bulkAdd(data.workflowHistory)
  }

  /**
   * Get current seed version from localStorage
   */
  private static getSeedVersion(): number {
    if (typeof window === 'undefined') return 0
    const stored = localStorage.getItem('seed-version')
    return stored ? parseInt(stored, 10) : 0
  }

  /**
   * Save seed version to localStorage
   */
  private static setSeedVersion(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('seed-version', SEED_VERSION.toString())
  }

  /**
   * Seed if version changed or database is empty
   * This handles the case where password hashing algorithm changed
   */
  static async seedIfVersionChanged(): Promise<boolean> {
    const currentVersion = this.getSeedVersion()

    if (currentVersion < SEED_VERSION) {
      // Clear login attempts to avoid lockout after re-seed
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS)
      }

      await this.clearAll()
      await this.seedAll()
      this.setSeedVersion()
      return true
    }

    // If not seeded at all, seed and set version
    const isSeeded = await this.isSeeded()
    if (!isSeeded) {
      await this.seedAll()
      this.setSeedVersion()
      return true
    }

    return false
  }
}
