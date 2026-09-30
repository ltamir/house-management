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

export type BuildingData = {
  tenants: Tenant[]
  apartments: Apartment[]
  payments: Payment[]
  expenses: Expense[]
  issues: Issue[]
}

export type CollectionName = keyof BuildingData

export type BuildingRecord = Tenant | Apartment | Payment | Expense | Issue

export type Page = 'overview' | 'tenants' | 'apartments' | 'payments' | 'expenses' | 'issues'
export type CollectionPage = Exclude<Page, 'overview'>