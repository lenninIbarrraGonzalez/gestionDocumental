/**
 * Validate Colombian NIT format (9 digits + dash + verification digit)
 */
export function isValidNIT(nit: string): boolean {
  const pattern = /^\d{9}-\d$/
  return pattern.test(nit)
}

/**
 * Validate Colombian cedula (8-10 digits)
 */
export function isValidCedula(cedula: string): boolean {
  const pattern = /^\d{8,10}$/
  return pattern.test(cedula)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

/**
 * Validate Colombian phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const pattern = /^\d{10}$/
  return pattern.test(phone)
}

/**
 * Validate password strength (min 8 chars, uppercase, lowercase, number, special)
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return hasUppercase && hasLowercase && hasNumber && hasSpecial
}

/**
 * Validate document code format (PREFIX-YYYY-NNNNN)
 */
export function isValidDocumentCode(code: string): boolean {
  const pattern = /^[A-Z_]+-\d{4}-\d{5}$/
  return pattern.test(code)
}
