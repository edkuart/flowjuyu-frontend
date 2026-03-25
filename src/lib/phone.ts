/**
 * src/lib/phone.ts
 *
 * Shared phone number type and utilities.
 * Used by components, pages, and service helpers.
 */

export type PhoneNumber = {
  country_code: string // e.g. "502"
  number: string       // local digits only, e.g. "55554446"
}

/** Display format: +502 5555-4446 */
export function formatPhone(phone: PhoneNumber | null | undefined): string {
  if (!phone?.country_code || !phone?.number) return "—"
  // Insert a dash after the 4th digit if the number is 8 digits
  const formatted =
    phone.number.length === 8
      ? `${phone.number.slice(0, 4)}-${phone.number.slice(4)}`
      : phone.number
  return `+${phone.country_code} ${formatted}`
}

/** Full WhatsApp URL: https://wa.me/50255554446 */
export function phoneToWaUrl(phone: PhoneNumber | null | undefined): string | null {
  if (!phone?.country_code || !phone?.number) return null
  return `https://wa.me/${phone.country_code}${phone.number}`
}

/** Boolean check for whether a phone is set */
export function hasPhone(phone: PhoneNumber | null | undefined): boolean {
  return Boolean(phone?.country_code && phone?.number?.trim())
}
