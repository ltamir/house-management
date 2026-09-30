import { useState } from 'react'
import { CircleHelp, ClipboardList, DoorOpen, Eye, Pencil, Search, Trash2, Users, Wallet } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { collectionNames, singularLabels } from '../config/recordForms'
import type { Apartment, BuildingData, BuildingRecord, CollectionName, CollectionPage, Expense, Issue, Payment, Tenant } from '../types'
import { formatDate, formatMoney, formatMonth } from '../lib/formatters'

type CollectionPageProps = {
  page: CollectionPage
  building: BuildingData
  getApartmentName: (id: string) => string
  getTenantName: (id: string) => string
  onDelete: (collection: CollectionName, id: string) => void
  onEdit: (record: BuildingRecord) => void
  onViewApartment: (apartment: Apartment) => void
  onAdd: () => void
}

export default function CollectionPageView({ page, building, getApartmentName, getTenantName, onDelete, onEdit, onViewApartment, onAdd }: CollectionPageProps) {
  const [search, setSearch] = useState('')
  const collection = collectionNames[page]
  const rows = building[collection] as (Tenant | Apartment | Payment | Expense | Issue)[]
  const query = search.trim().toLocaleLowerCase('he')
  const filtered = rows.filter((row) => {
    const names: Record<CollectionPage, string> = {
      tenants: (row as Tenant).name + ' ' + (row as Tenant).phone + ' ' + getApartmentName((row as Tenant).apartmentId),
      apartments: 'דירה ' + (row as Apartment).number + ' ' + (row as Apartment).floor,
      payments: getTenantName((row as Payment).tenantId) + ' ' + (row as Payment).month,
      expenses: (row as Expense).title + ' ' + (row as Expense).category + ' ' + (row as Expense).vendor,
      issues: (row as Issue).title + ' ' + getApartmentName((row as Issue).apartmentId) + ' ' + (row as Issue).status,
    }
    return names[page].toLocaleLowerCase('he').includes(query)
  })
  const countLabel: Record<CollectionPage, string> = {
    tenants: 'דיירים', apartments: 'דירות', payments: 'תשלומים', expenses: 'הוצאות', issues: 'תקלות',
  }
  const emptyIcon = page === 'tenants' ? Users : page === 'apartments' ? DoorOpen : page === 'payments' ? Wallet : page === 'expenses' ? ClipboardList : CircleHelp

  return <section className="panel collection-panel">
    <div className="collection-toolbar"><div className="record-count">{filtered.length} {countLabel[page]}</div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="חיפוש..." aria-label="חיפוש ברשומות" /></label></div>
    {filtered.length ? <div className="table-wrap"><table className="full-table"><thead><tr>{page === 'tenants' ? <><th>דייר/ת</th><th>דירה</th><th>טלפון</th><th>דוא״ל</th></> : page === 'apartments' ? <><th>דירה</th><th>קומה</th><th>חדרים</th><th>דייר/ת</th></> : page === 'payments' ? <><th>דייר/ת</th><th>עבור חודש</th><th>תאריך</th><th>סטטוס</th><th>סכום</th></> : page === 'expenses' ? <><th>תיאור</th><th>קטגוריה</th><th>תאריך</th><th>ספק / הערה</th><th>סכום</th></> : <><th>תיאור התקלה</th><th>מיקום</th><th>תאריך</th><th>דחיפות</th><th>סטטוס</th></>}</tr></thead>
      <tbody>{filtered.map((row) => <tr key={row.id}>
        {page === 'tenants' && <><td><span className="table-primary">{(row as Tenant).name}</span></td><td>{getApartmentName((row as Tenant).apartmentId)}</td><td dir="ltr" className="ltr-cell">{(row as Tenant).phone}</td><td dir="ltr" className="ltr-cell">{(row as Tenant).email || '—'}</td></>}
        {page === 'apartments' && <><td><span className="table-primary">דירה {(row as Apartment).number}</span></td><td>{(row as Apartment).floor}</td><td>{(row as Apartment).rooms}</td><td>{building.tenants.find((tenant) => tenant.apartmentId === row.id)?.name || <span className="muted">פנויה</span>}</td></>}
        {page === 'payments' && <><td>{getTenantName((row as Payment).tenantId)}</td><td>{formatMonth((row as Payment).month)}</td><td>{formatDate((row as Payment).date)}</td><td><StatusBadge value={(row as Payment).status} /></td><td className="money-cell">{formatMoney((row as Payment).amount)}</td></>}
        {page === 'expenses' && <><td><span className="table-primary">{(row as Expense).title}</span></td><td>{(row as Expense).category}</td><td>{formatDate((row as Expense).date)}</td><td>{(row as Expense).vendor || '—'}</td><td className="money-cell">{formatMoney((row as Expense).amount)}</td></>}
        {page === 'issues' && <><td><span className="table-primary">{(row as Issue).title}</span></td><td>{getApartmentName((row as Issue).apartmentId)}</td><td>{formatDate((row as Issue).date)}</td><td><span className={`priority-text ${(row as Issue).priority === 'דחופה' ? 'priority-urgent' : ''}`}>{(row as Issue).priority}</span></td><td><StatusBadge value={(row as Issue).status} /></td></>}
        <td className={`row-action-cell ${page === 'apartments' ? 'row-action-cell-apartment' : ''}`}><span className="row-actions">{page === 'apartments' && <button className="row-view" title="צפייה בפרטי דירה" aria-label="צפייה בפרטי דירה" onClick={() => onViewApartment(row as Apartment)}><Eye size={15} /></button>}<button className="row-edit" title="עריכת רשומה" aria-label="עריכת רשומה" onClick={() => onEdit(row)}><Pencil size={15} /></button><button className="row-delete" title="מחיקת רשומה" aria-label="מחיקת רשומה" onClick={() => onDelete(collection, row.id)}><Trash2 size={15} /></button></span></td>
      </tr>)}</tbody></table></div> : <EmptyState icon={emptyIcon} title={query ? 'לא מצאנו תוצאות' : 'אין כאן רשומות עדיין'} text={query ? 'נסו לחפש במילים אחרות.' : `אפשר להתחיל ולהוסיף ${singularLabels[page]} ראשון.`} action={query ? undefined : `הוספת ${singularLabels[page]}`} onClick={query ? undefined : onAdd} />}
  </section>
}