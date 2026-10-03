export type PersonRole = 'externalTenant' | 'neighbor' | 'cityEmployee' | 'supplier' | 'other'

export const personRoleLabels: Record<PersonRole, string> = {
  externalTenant: 'דייר/ת בבניין אחר',
  neighbor: 'שכן/ה',
  cityEmployee: 'עובד/ת עירייה',
  supplier: 'ספק/ית',
  other: 'אחר',
}

export type Person = {
  id: string
  name: string
  phone: string
  email: string
  roles: PersonRole[]
}

export type Tenancy = {
  id: string
  personId: string
  apartmentId: string
  startDate: string
  endDate: string
  isOwner: boolean
}

export type Tenant = Tenancy & Omit<Person, 'id'>

export type Apartment = {
  id: string
  number: string
  floor: string
  rooms?: string
  size?: string
}

export const BUILDING_PAYMENT_LOCATION = 'building'

export type Payment = {
  id: string
  personId: string
  apartmentId: string
  fromMonth: string
  toMonth: string
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
  supplierPersonId?: string
}

export type Issue = {
  id: string
  title: string
  apartmentId: string
  date: string
  priority: 'רגילה' | 'דחופה'
  status: 'פתוחה' | 'בטיפול' | 'טופלה'
  contactPersonId?: string
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
  people: Person[]
  tenancies: Tenancy[]
  apartments: Apartment[]
  payments: Payment[]
  expenses: Expense[]
  issues: Issue[]
  utilities: ApartmentUtilities
}

export type CollectionName = Exclude<keyof BuildingData, 'utilities' | 'monthlyPaymentAmount'>

export type BuildingRecord = Person | Tenancy | Apartment | Payment | Expense | Issue

export type Page = 'overview' | 'transactions' | 'contacts' | 'tenants' | 'apartments' | 'payments' | 'expenses' | 'issues'
export type CollectionPage = Exclude<Page, 'overview' | 'transactions'>