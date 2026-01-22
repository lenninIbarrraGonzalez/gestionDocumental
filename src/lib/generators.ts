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

/**
 * Simple hash function for demo purposes (synchronous)
 * In production, use bcrypt or similar
 */
function simpleHash(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Hash password (synchronous version for demo purposes)
 * In production, use bcrypt or similar
 */
export function hashPassword(password: string): string {
  // Add a salt prefix for basic security
  const salted = `demo_salt_${password}`
  return simpleHash(salted)
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
