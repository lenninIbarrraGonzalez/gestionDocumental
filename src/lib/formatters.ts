/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  let d: Date

  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format without timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number)
      d = new Date(year, month - 1, day)
    } else {
      d = new Date(date)
    }
  } else {
    d = date
  }

  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date and time to DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dateStr = formatDate(d)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}`
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Format number as Colombian pesos
 */
export function formatCurrency(amount: number, showDecimals = false): string {
  const integerPart = Math.floor(amount)
  const decimalPart = Math.round((amount - integerPart) * 100)

  // Format integer part with dots as thousand separators
  const formattedInteger = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (showDecimals) {
    const formattedDecimal = decimalPart.toString().padStart(2, '0')
    return `$${formattedInteger},${formattedDecimal}`
  }

  return `$${formattedInteger}`
}

/**
 * Format NIT with dots and dash
 */
export function formatNIT(nit: string, dv?: string): string {
  const clean = nit.replace(/\D/g, '')
  const formatted = clean.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')

  if (dv) {
    return `${formatted}-${dv}`
  }

  return formatted
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')

  if (clean.length === 10) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`
  }

  return phone
}
