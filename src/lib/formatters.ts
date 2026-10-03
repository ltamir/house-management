const currency = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })

export const formatMoney = (value: number) => currency.format(value)
export const today = () => new Date().toISOString().slice(0, 10)
export const monthNow = () => today().slice(0, 7)

export function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(date)
}

export function formatMonth(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}-15T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date)
}

export function formatMonthRange(fromMonth: string, toMonth: string) {
  if (!fromMonth) return '—'
  if (!toMonth || fromMonth === toMonth) return formatMonth(fromMonth)
  return `${formatMonth(fromMonth)} – ${formatMonth(toMonth)}`
}