import type { Apartment, BuildingData, CollectionName, CollectionPage, Expense, Issue, Payment, Tenant, UtilityKind } from '../types'
import { recordForms } from '../config/recordForms'
import { makeId, today } from '../lib/formatters'

const STORAGE_KEY = 'beitenu-building-data-v1'

const emptyBuilding: BuildingData = {
  monthlyPaymentAmount: 0,
  tenants: [],
  apartments: [],
  payments: [],
  expenses: [],
  issues: [],
  utilities: { water: [], electricity: [] },
}

export function loadBuilding(): BuildingData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyBuilding
    const parsed = JSON.parse(saved) as Partial<BuildingData>
    return {
      monthlyPaymentAmount: typeof parsed.monthlyPaymentAmount === 'number' && Number.isFinite(parsed.monthlyPaymentAmount) ? parsed.monthlyPaymentAmount : 0,
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants.map((tenant) => ({
        ...tenant,
        isOwner: tenant.isOwner === true,
      })) : [],
      apartments: Array.isArray(parsed.apartments) ? parsed.apartments : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments.map((payment) => {
        const migratedPayment = { ...payment } as Payment & { month?: string }
        const legacyMonth = migratedPayment.month || ''
        const fromMonth = migratedPayment.fromMonth || legacyMonth
        const toMonth = migratedPayment.toMonth || legacyMonth || fromMonth
        delete migratedPayment.month
        return { ...migratedPayment, fromMonth, toMonth }
      }) : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      utilities: {
        water: Array.isArray(parsed.utilities?.water) ? parsed.utilities.water : [],
        electricity: Array.isArray(parsed.utilities?.electricity) ? parsed.utilities.electricity : [],
      },
    }
  } catch {
    return emptyBuilding
  }
}

export function saveBuilding(building: BuildingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(building))
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
}

export function createUtilityPayment(
  type: UtilityKind,
  apartmentId: string,
  values: Omit<BuildingData['utilities']['water'][number], 'id' | 'apartmentId' | 'createdAt'>,
) {
  return {
    type,
    payment: { ...values, id: makeId(), apartmentId, createdAt: new Date().toISOString() },
  }
}

export function createBuildingRecord(page: CollectionPage, values: Record<string, string>, id: string = makeId()) {
  const collection = recordForms[page].collection
  let record: Tenant | Apartment | Payment | Expense | Issue

  if (collection === 'tenants') record = { id, name: values.name, phone: values.phone, email: values.email, apartmentId: values.apartmentId, isOwner: values.isOwner === 'true' }
  else if (collection === 'apartments') record = { id, number: values.number, floor: values.floor, rooms: values.rooms || '', size: values.size || '' }
  else if (collection === 'payments') record = { id, tenantId: values.tenantId, fromMonth: values.fromMonth, toMonth: values.toMonth, amount: Number(values.amount), date: values.date || today(), status: (values.status || 'ממתין') as Payment['status'] }
  else if (collection === 'expenses') record = { id, title: values.title, category: values.category || 'אחר', amount: Number(values.amount), date: values.date, vendor: values.vendor }
  else record = { id, title: values.title, apartmentId: values.apartmentId, date: values.date, priority: (values.priority || 'רגילה') as Issue['priority'], status: (values.status || 'פתוחה') as Issue['status'] }

  return { collection: collection as CollectionName, record }
}