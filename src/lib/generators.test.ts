import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateDocumentCode,
  generateSlug,
  hashPassword,
  verifyPassword,
} from './generators'

describe('generators', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('generateDocumentCode', () => {
    it('should generate code with correct format', () => {
      const code = generateDocumentCode('DOC', 2024, 1)
      expect(code).toBe('DOC-2024-00001')
    })

    it('should pad sequence number correctly', () => {
      expect(generateDocumentCode('FURAT', 2024, 23)).toBe('FURAT-2024-00023')
      expect(generateDocumentCode('CERT', 2024, 999)).toBe('CERT-2024-00999')
    })

    it('should handle different prefixes', () => {
      expect(generateDocumentCode('POL_SST', 2024, 1)).toBe('POL_SST-2024-00001')
    })
  })

  describe('generateSlug', () => {
    it('should convert text to slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Política SST 2024!')).toBe('politica-sst-2024')
    })

    it('should handle multiple spaces', () => {
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })
  })

  describe('hashPassword', () => {
    it('should hash password and verify correctly', () => {
      const password = 'password123'
      const hash = hashPassword(password)

      // bcrypt hashes are different each time due to random salt
      expect(hash).not.toBe(password)
      expect(verifyPassword(password, hash)).toBe(true)
    })

    it('should produce different hashes for same password (bcrypt uses random salt)', () => {
      const hash1 = hashPassword('password123')
      const hash2 = hashPassword('password123')

      // bcrypt generates unique hashes due to random salts
      expect(hash1).not.toBe(hash2)
      // But both should verify correctly
      expect(verifyPassword('password123', hash1)).toBe(true)
      expect(verifyPassword('password123', hash2)).toBe(true)
    })

    it('should not verify incorrect password', () => {
      const hash = hashPassword('correctPassword')
      expect(verifyPassword('wrongPassword', hash)).toBe(false)
    })
  })
})
