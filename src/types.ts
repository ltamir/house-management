export type Tenant = {
  id: string
  name: string
  phone: string
  email: string
  apartmentId: string
}

export type Apartment = {
  id: string
  number: string
  floor: string
  rooms: string
}

export type Payment = {
  id: string
  tenantId: string
  month: string
  amount: number
  date: string
  status: 'שולם' | 'ממתין'
}

export type Expense = {
  id: string
  title: string
  category: string
  amount: number
  date: string
  vendor: string
}

export type Issue = {
  id: string
  title: string
  apartmentId: string
  date: string
  priority: 'רגילה' | 'דחופה'
  status: 'פתוחה' | 'בטיפול' | 'טופלה'
}

export type UtilityKind = 'water' | 'electricity'

export type UtilityPayment = {
  id: string
  apartmentId: string
  amount: number
  meterReading: number
  fromDate: string
  toDate: string
  createdAt: string
}

export type ApartmentUtilities = Record<UtilityKind, UtilityPayment[]>

export type BuildingData = {
  monthlyPaymentAmount: number
  tenants: Tenant[]
  apartments: Apartment[]
  payments: Payment[]
  expenses: Expense[]
  issues: Issue[]
  utilities: ApartmentUtilities
}

export type CollectionName = Exclude<keyof BuildingData, 'utilities'>

export type BuildingRecord = Tenant | Apartment | Payment | Expense | Issue

export type Page = 'overview' | 'transactions' | 'tenants' | 'apartments' | 'payments' | 'expenses' | 'issues'
export type CollectionPage = Exclude<Page, 'overview' | 'transactions'>