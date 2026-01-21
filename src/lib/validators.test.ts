import { describe, it, expect } from 'vitest'
import {
  isValidNIT,
  isValidCedula,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidDocumentCode,
} from './validators'

describe('validators', () => {
  describe('isValidNIT', () => {
    it('should validate correct NIT format', () => {
      expect(isValidNIT('900123456-1')).toBe(true)
      expect(isValidNIT('800987654-2')).toBe(true)
    })

    it('should reject invalid NIT format', () => {
      expect(isValidNIT('123')).toBe(false)
      expect(isValidNIT('abcdefghi-1')).toBe(false)
      expect(isValidNIT('')).toBe(false)
    })
  })

  describe('isValidCedula', () => {
    it('should validate correct cedula format', () => {
      expect(isValidCedula('1234567890')).toBe(true)
      expect(isValidCedula('12345678')).toBe(true)
    })

    it('should reject invalid cedula format', () => {
      expect(isValidCedula('123')).toBe(false)
      expect(isValidCedula('12345678901234')).toBe(false)
      expect(isValidCedula('abcdefgh')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co')).toBe(true)
    })

    it('should reject invalid email format', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('missing@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate correct phone format', () => {
      expect(isValidPhone('3001234567')).toBe(true)
      expect(isValidPhone('6011234567')).toBe(true)
    })

    it('should reject invalid phone format', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('12345678901234')).toBe(false)
      expect(isValidPhone('abcdefghij')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong password', () => {
      expect(isValidPassword('Password123!')).toBe(true)
      expect(isValidPassword('Str0ng@Pass')).toBe(true)
    })

    it('should reject weak password', () => {
      expect(isValidPassword('weak')).toBe(false)
      expect(isValidPassword('12345678')).toBe(false)
      expect(isValidPassword('password')).toBe(false)
    })
  })

  describe('isValidDocumentCode', () => {
    it('should validate correct document code format', () => {
      expect(isValidDocumentCode('DOC-2024-00001')).toBe(true)
      expect(isValidDocumentCode('FURAT-2024-00023')).toBe(true)
    })

    it('should reject invalid document code format', () => {
      expect(isValidDocumentCode('invalid')).toBe(false)
      expect(isValidDocumentCode('DOC-24-001')).toBe(false)
    })
  })
})
