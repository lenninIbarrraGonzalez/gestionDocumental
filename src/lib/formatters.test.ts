import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  formatCurrency,
  formatNIT,
  formatPhone,
} from './formatters'

describe('formatters', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T12:00:00')
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('should handle string dates', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatDateTime(date)).toBe('15/01/2024 14:30')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1536)).toBe('1.50 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB')
      expect(formatFileSize(5242880)).toBe('5.00 MB')
    })
  })

  describe('formatCurrency', () => {
    it('should format Colombian pesos correctly', () => {
      expect(formatCurrency(1000000)).toBe('$1.000.000')
    })

    it('should format with decimals when provided', () => {
      expect(formatCurrency(1500.50, true)).toBe('$1.500,50')
    })
  })

  describe('formatNIT', () => {
    it('should format NIT with verification digit', () => {
      expect(formatNIT('900123456', '1')).toBe('900.123.456-1')
    })

    it('should format NIT without verification digit', () => {
      expect(formatNIT('900123456')).toBe('900.123.456')
    })
  })

  describe('formatPhone', () => {
    it('should format mobile phone number', () => {
      expect(formatPhone('3001234567')).toBe('300 123 4567')
    })

    it('should format landline number', () => {
      expect(formatPhone('6011234567')).toBe('601 123 4567')
    })
  })
})
