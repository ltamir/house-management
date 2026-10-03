import { useState } from 'react'
import { Building2, CircleHelp, ClipboardList, DoorOpen, Search, Users, Wallet } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ApartmentTile from '../components/ApartmentTile'
import CollectionTableRow from '../components/CollectionTableRow'
import { collectionNames, singularLabels } from '../config/recordForms'
import { BUILDING_PAYMENT_LOCATION, personRoleLabels, type Apartment, type BuildingData, type BuildingRecord, type CollectionName, type CollectionPage, type Expense, type Issue, type Payment, type Person, type Tenancy } from '../types'
import { getTenantViews, isActiveTenancy } from '../lib/tenantViews'

const apartmentNumberCollator = new Intl.Collator('he', { numeric: true, sensitivity: 'base' })

type CollectionPageProps = {
  page: CollectionPage
  building: BuildingData
  getApartmentName: (id: string) => string
  getPersonName: (id: string) => string
  onDelete: (collection: CollectionName, id: string) => void
  onEdit: (record: BuildingRecord) => void
  onViewApartment: (apartment: Apartment) => void
  onAddPayment: (apartmentId: string, tenantId: string) => void
  onAdd: () => void
  onCreateBuilding: () => void
}

export default function CollectionPageView({ page, building, getApartmentName, getPersonName, onDelete, onEdit, onViewApartment, onAddPayment, onAdd, onCreateBuilding }: CollectionPageProps) {
  const [search, setSearch] = useState('')
  const collection = collectionNames[page]
  const contactPeople = building.people.filter((person) => person.roles.length > 0 || !building.tenancies.some((tenancy) => tenancy.personId === person.id))
  const rows = (page === 'contacts' ? contactPeople : page === 'tenants' ? building.tenancies : building[collection]) as BuildingRecord[]
  const query = search.trim().toLocaleLowerCase('he')
  const filtered = rows.filter((row) => {
    const names: Record<CollectionPage, string> = {
      contacts: `${(row as Person).name} ${(row as Person).phone} ${(row as Person).email} ${(row as Person).roles.map((role) => personRoleLabels[role]).join(' ')}`,
      tenants: `${getPersonName((row as Tenancy).personId)} ${getApartmentName((row as Tenancy).apartmentId)} ${(row as Tenancy).startDate} ${(row as Tenancy).endDate}`,
      apartments: 'דירה ' + (row as Apartment).number + ' ' + (row as Apartment).floor,
      payments: getPersonName((row as Payment).personId) + ' ' + ((row as Payment).apartmentId === BUILDING_PAYMENT_LOCATION ? 'בניין' : getApartmentName((row as Payment).apartmentId)) + ' ' + (row as Payment).fromMonth + ' ' + (row as Payment).toMonth,
      expenses: (row as Expense).title + ' ' + (row as Expense).category + ' ' + (row as Expense).vendor + ' ' + getPersonName((row as Expense).supplierPersonId || ''),
      issues: (row as Issue).title + ' ' + getApartmentName((row as Issue).apartmentId) + ' ' + (row as Issue).status + ' ' + getPersonName((row as Issue).contactPersonId || ''),
    }
    return names[page].toLocaleLowerCase('he').includes(query)
  })
  const countLabel: Record<CollectionPage, string> = {
    contacts: 'אנשי קשר', tenants: 'דיירויות', apartments: 'דירות', payments: 'תשלומים', expenses: 'הוצאות', issues: 'תקלות',
  }
  const emptyIcon = page === 'contacts' || page === 'tenants' ? Users : page === 'apartments' ? DoorOpen : page === 'payments' ? Wallet : page === 'expenses' ? ClipboardList : CircleHelp

  if (page === 'apartments') {
    const currentYear = String(new Date().getFullYear())
    const apartments = (filtered as Apartment[]).sort((first, second) => apartmentNumberCollator.compare(first.number, second.number))
    const activeTenants = getTenantViews(building).filter((tenant) => isActiveTenancy(tenant))

    return <section className="panel collection-panel apartment-collection-panel">
      <div className="collection-toolbar"><div className="record-count">{filtered.length} דירות</div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="חיפוש..." aria-label="חיפוש בדירות" /></label></div>
      {apartments.length ? <div className="apartments-grid">{apartments.map((apartment) => {
        const tenants = activeTenants.filter((tenant) => tenant.apartmentId === apartment.id)
        const annualPaidTotal = building.payments
          .filter((payment) => payment.apartmentId === apartment.id && payment.status === 'שולם' && payment.date.startsWith(currentYear))
          .reduce((total, payment) => total + payment.amount, 0)

        return <ApartmentTile key={apartment.id} apartment={apartment} tenants={tenants} annualPaidTotal={annualPaidTotal} onView={onViewApartment} onEdit={onEdit} onAddPayment={onAddPayment} onDelete={() => onDelete(collection, apartment.id)} />
      })}</div> : query ? <EmptyState icon={emptyIcon} title="לא מצאנו תוצאות" text="נסו לחפש במילים אחרות." /> : building.apartments.length === 0 ? <div className="empty-state building-empty-state">
        <button type="button" className="building-empty-icon" onClick={onCreateBuilding} aria-label="הקמת הבניין ויצירת דירות"><Building2 size={25} /></button>
        <strong>הבניין עדיין ריק</strong>
        <p>לחצו על הבניין כדי להגדיר קומות ודירות וליצור דייר/ת לכל דירה.</p>
        <button type="button" className="empty-action" onClick={onCreateBuilding}>הקמת הבניין</button>
      </div> : <EmptyState icon={emptyIcon} title="אין כאן רשומות עדיין" text={`אפשר להוסיף ${singularLabels[page]} ראשון.`} action={`הוספת ${singularLabels[page]}`} onClick={onAdd} />}
    </section>
  }

  return <section className="panel collection-panel">
    <div className="collection-toolbar"><div className="record-count">{filtered.length} {countLabel[page]}</div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="חיפוש..." aria-label="חיפוש ברשומות" /></label></div>
    {filtered.length ? <div className="table-wrap"><table className="full-table"><thead><tr>{page === 'contacts' ? <><th>שם</th><th>תפקידים וקשרים</th><th>טלפון</th><th>דוא״ל</th></> : page === 'tenants' ? <><th>דייר/ת</th><th>דירה</th><th>כניסה</th><th>יציאה</th><th>טלפון</th><th>דוא״ל</th><th>בעלות</th></> : page === 'payments' ? <><th>דייר/ת</th><th>דירה / מיקום</th><th>עבור חודש</th><th>תאריך</th><th>סטטוס</th><th>סכום</th></> : page === 'expenses' ? <><th>תיאור</th><th>קטגוריה</th><th>תאריך</th><th>ספק / הערה</th><th>סכום</th></> : <><th>תיאור התקלה</th><th>מיקום</th><th>איש/אשת קשר</th><th>תאריך</th><th>דחיפות</th><th>סטטוס</th></>}</tr></thead>
      <tbody>{filtered.map((row) => <CollectionTableRow key={row.id} page={page} row={row} collection={collection} people={building.people} getApartmentName={getApartmentName} getPersonName={getPersonName} onEdit={onEdit} onDelete={onDelete} />)}</tbody></table></div> : <EmptyState icon={emptyIcon} title={query ? 'לא מצאנו תוצאות' : 'אין כאן רשומות עדיין'} text={query ? 'נסו לחפש במילים אחרות.' : `אפשר להתחיל ולהוסיף ${singularLabels[page]} ראשון.`} action={query ? undefined : `הוספת ${singularLabels[page]}`} onClick={query ? undefined : onAdd} />}
  </section>
}