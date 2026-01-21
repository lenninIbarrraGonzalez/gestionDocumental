import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateDocumentCode,
  generateSlug,
  hashPassword,
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
    it('should hash password consistently', async () => {
      const hash1 = await hashPassword('password123')
      const hash2 = await hashPassword('password123')

      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1')
      const hash2 = await hashPassword('password2')

      expect(hash1).not.toBe(hash2)
    })
  })
})
