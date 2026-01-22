import bcrypt from 'bcryptjs'

/**
 * Generate unique ID using crypto API
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Generate document code in format PREFIX-YYYY-NNNNN
 */
export function generateDocumentCode(
  prefix: string,
  year: number,
  sequence: number
): string {
  const paddedSequence = sequence.toString().padStart(5, '0')
  return `${prefix}-${year}-${paddedSequence}`
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
}

// Password hashing configuration
const BCRYPT_ROUNDS = 10

/**
 * Hash password using bcrypt (synchronous version for seed data)
 * Uses bcryptjs which works in both Node.js and browser environments
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS)
}

/**
 * Async password hashing using bcrypt (recommended for runtime use)
 */
export async function hashPasswordAsync(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify password against bcrypt hash (synchronous)
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

/**
 * Async password verification using bcrypt (recommended for runtime use)
 */
export async function verifyPasswordAsync(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
