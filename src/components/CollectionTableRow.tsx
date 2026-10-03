import { Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { BUILDING_PAYMENT_LOCATION, personRoleLabels, type BuildingData, type BuildingRecord, type CollectionName, type CollectionPage, type Expense, type Issue, type Payment, type Person, type Tenancy } from '../types'
import { formatDate, formatMoney, formatMonthRange } from '../lib/formatters'

type CollectionTableRowProps = {
  page: Exclude<CollectionPage, 'apartments'>
  row: BuildingRecord
  collection: CollectionName
  getApartmentName: (id: string) => string
  people: BuildingData['people']
  getPersonName: (id: string) => string
  onEdit: (record: BuildingRecord) => void
  onDelete: (collection: CollectionName, id: string) => void
}

export default function CollectionTableRow({ page, row, collection, people, getApartmentName, getPersonName, onEdit, onDelete }: CollectionTableRowProps) {
  const personName = (personId: string) => people.find((person) => person.id === personId)?.name || 'איש קשר לא ידוע'
  const roleNames = (person: Person) => person.roles.map((role) => personRoleLabels[role]).join(', ') || '—'

  return <tr>
    {page === 'contacts' && <><td><span className="table-primary">{(row as Person).name}</span></td><td>{roleNames(row as Person)}</td><td dir="ltr" className="ltr-cell">{(row as Person).phone || '—'}</td><td dir="ltr" className="ltr-cell">{(row as Person).email || '—'}</td></>}
    {page === 'tenants' && <><td><span className="table-primary">{personName((row as Tenancy).personId)}</span></td><td>{getApartmentName((row as Tenancy).apartmentId)}</td><td>{(row as Tenancy).startDate || '—'}</td><td>{(row as Tenancy).endDate || 'פעילה'}</td><td dir="ltr" className="ltr-cell">{people.find((person) => person.id === (row as Tenancy).personId)?.phone || '—'}</td><td dir="ltr" className="ltr-cell">{people.find((person) => person.id === (row as Tenancy).personId)?.email || '—'}</td><td>{(row as Tenancy).isOwner ? <span className="owner-badge">בעל/ת הדירה</span> : <span className="muted">דייר/ת</span>}</td></>}
    {page === 'payments' && <><td>{(row as Payment).personId ? getPersonName((row as Payment).personId) : '—'}</td><td>{(row as Payment).apartmentId === BUILDING_PAYMENT_LOCATION ? 'בניין' : getApartmentName((row as Payment).apartmentId)}</td><td>{formatMonthRange((row as Payment).fromMonth, (row as Payment).toMonth)}</td><td>{formatDate((row as Payment).date)}</td><td><StatusBadge value={(row as Payment).status} /></td><td className="money-cell">{formatMoney((row as Payment).amount)}</td></>}
    {page === 'expenses' && <><td><span className="table-primary">{(row as Expense).title}</span></td><td>{(row as Expense).category}</td><td>{formatDate((row as Expense).date)}</td><td>{[(row as Expense).supplierPersonId ? getPersonName((row as Expense).supplierPersonId!) : '', (row as Expense).vendor].filter(Boolean).join(' · ') || '—'}</td><td className="money-cell">{formatMoney((row as Expense).amount)}</td></>}
    {page === 'issues' && <><td><span className="table-primary">{(row as Issue).title}</span></td><td>{getApartmentName((row as Issue).apartmentId)}</td><td>{(row as Issue).contactPersonId ? getPersonName((row as Issue).contactPersonId || '') : '—'}</td><td>{formatDate((row as Issue).date)}</td><td><span className={`priority-text ${(row as Issue).priority === 'דחופה' ? 'priority-urgent' : ''}`}>{(row as Issue).priority}</span></td><td><StatusBadge value={(row as Issue).status} /></td></>}
    <td className="row-action-cell"><span className="row-actions"><button className="row-edit" title="עריכת רשומה" aria-label="עריכת רשומה" onClick={() => onEdit(row)}><Pencil size={15} /></button><button className="row-delete" title="מחיקת רשומה" aria-label="מחיקת רשומה" onClick={() => onDelete(collection, row.id)}><Trash2 size={15} /></button></span></td>
  </tr>
}