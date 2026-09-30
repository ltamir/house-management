import type { Apartment, BuildingData, CollectionName, CollectionPage, Expense, Issue, Payment, Tenant } from '../types'
import { recordForms } from '../config/recordForms'
import { makeId, today } from '../lib/formatters'

const STORAGE_KEY = 'beitenu-building-data-v1'

const emptyBuilding: BuildingData = {
  tenants: [],
  apartments: [],
  payments: [],
  expenses: [],
  issues: [],
}

export function loadBuilding(): BuildingData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyBuilding
    const parsed = JSON.parse(saved) as Partial<BuildingData>
    return {
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      apartments: Array.isArray(parsed.apartments) ? parsed.apartments : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
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

export function createBuildingRecord(page: CollectionPage, values: Record<string, string>, id = makeId()) {
  const collection = recordForms[page].collection
  let record: Tenant | Apartment | Payment | Expense | Issue

  if (collection === 'tenants') record = { id, name: values.name, phone: values.phone, email: values.email, apartmentId: values.apartmentId }
  else if (collection === 'apartments') record = { id, number: values.number, floor: values.floor, rooms: values.rooms }
  else if (collection === 'payments') record = { id, tenantId: values.tenantId, month: values.month, amount: Number(values.amount), date: values.date || today(), status: (values.status || 'ממתין') as Payment['status'] }
  else if (collection === 'expenses') record = { id, title: values.title, category: values.category || 'אחר', amount: Number(values.amount), date: values.date, vendor: values.vendor }
  else record = { id, title: values.title, apartmentId: values.apartmentId, date: values.date, priority: (values.priority || 'רגילה') as Issue['priority'], status: (values.status || 'פתוחה') as Issue['status'] }

  return { collection: collection as CollectionName, record }
}