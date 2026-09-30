const currency = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })

export const formatMoney = (value: number) => currency.format(value)
export const today = () => new Date().toISOString().slice(0, 10)
export const monthNow = () => today().slice(0, 7)
export const makeId = () => crypto.randomUUID()

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