import type { Apartment, BuildingData, CollectionName, CollectionPage, Expense, Issue, Payment, Person, PersonRole, PlannedExpense, Tenancy, UtilityKind } from '../types'
import { recordForms } from '../config/recordForms'
import { makeId, today } from '../lib/formatters'
import { BUILDING_PAYMENT_LOCATION } from '../types'

const STORAGE_KEY = 'beitenu-building-data-v1'

const emptyBuilding: BuildingData = {
  monthlyPaymentAmount: 0,
  people: [],
  tenancies: [],
  apartments: [],
  payments: [],
  expenses: [],
  plannedExpenses: [],
  issues: [],
  utilities: { water: [], electricity: [] },
}

export function loadBuilding(): BuildingData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyBuilding
    const parsed = JSON.parse(saved) as Partial<BuildingData> & {
      tenants?: { id: string; name: string; phone: string; email: string; apartmentId: string; isOwner?: boolean; startDate?: string; endDate?: string }[]
      payments?: (Payment & { tenantId?: string; month?: string })[]
    }
    const legacyTenants = Array.isArray(parsed.tenants) ? parsed.tenants : []
    const people: Person[] = Array.isArray(parsed.people) ? parsed.people.map((person) => ({
      ...person,
      roles: Array.isArray(person.roles) ? person.roles : [],
    })) : legacyTenants.map(({ id, name, phone, email }) => ({ id, name, phone, email, roles: [] }))
    const tenancies: Tenancy[] = Array.isArray(parsed.tenancies) ? parsed.tenancies : legacyTenants.map((tenant) => ({
      id: makeId(),
      personId: tenant.id,
      apartmentId: tenant.apartmentId,
      startDate: tenant.startDate || '',
      endDate: tenant.endDate || '',
      isOwner: tenant.isOwner === true,
    }))
    return {
      monthlyPaymentAmount: typeof parsed.monthlyPaymentAmount === 'number' && Number.isFinite(parsed.monthlyPaymentAmount) ? parsed.monthlyPaymentAmount : 0,
      people,
      tenancies,
      apartments: Array.isArray(parsed.apartments) ? parsed.apartments : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments.map((payment) => {
        const migratedPayment = { ...payment } as Payment & { tenantId?: string; month?: string }
        const legacyMonth = migratedPayment.month || ''
        const fromMonth = migratedPayment.fromMonth || legacyMonth
        const toMonth = migratedPayment.toMonth || legacyMonth || fromMonth
        delete migratedPayment.month
        const personId = migratedPayment.personId || migratedPayment.tenantId || ''
        const apartmentId = migratedPayment.apartmentId || tenancies.find((tenancy) => tenancy.personId === personId)?.apartmentId || ''
        delete migratedPayment.tenantId
        return { ...migratedPayment, personId, apartmentId, fromMonth, toMonth }
      }) : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      plannedExpenses: Array.isArray(parsed.plannedExpenses) ? parsed.plannedExpenses.filter((expense): expense is PlannedExpense => Boolean(
        expense && typeof expense.id === 'string' && typeof expense.title === 'string'
        && [1, 2, 3, 4].includes(expense.intervalMonths) && Number.isFinite(expense.amount)
      )) : [],
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
  let record: Person | Tenancy | Apartment | Payment | Expense | Issue

  if (collection === 'people') record = { id, name: values.name, phone: values.phone, email: values.email, roles: JSON.parse(values.roles || '[]') as PersonRole[] }
  else if (collection === 'tenancies') record = { id, personId: values.personId, apartmentId: values.apartmentId, startDate: values.startDate, endDate: values.endDate || '', isOwner: values.isOwner === 'true' }
  else if (collection === 'apartments') record = { id, number: values.number, floor: values.floor, rooms: values.rooms || '', size: values.size || '' }
  else if (collection === 'payments') record = { id, personId: values.personId || '', apartmentId: values.apartmentId || BUILDING_PAYMENT_LOCATION, fromMonth: values.fromMonth, toMonth: values.toMonth, amount: Number(values.amount), date: values.date || today(), status: (values.status || 'ממתין') as Payment['status'] }
  else if (collection === 'expenses') record = { id, title: values.title, category: values.category || 'אחר', amount: Number(values.amount), date: values.date, vendor: values.vendor || '', supplierPersonId: values.supplierPersonId || '' }
  else record = { id, title: values.title, apartmentId: values.apartmentId, contactPersonId: values.contactPersonId || '', date: values.date, priority: (values.priority || 'רגילה') as Issue['priority'], status: (values.status || 'פתוחה') as Issue['status'] }

  return { collection: collection as CollectionName, record }
}