import { Pencil, Trash2 } from 'lucide-react'
import ContactTableCells from './ContactTableCells'
import ExpenseTableCells from './ExpenseTableCells'
import IssueTableCells from './IssueTableCells'
import PaymentTableCells from './PaymentTableCells'
import TenantTableCells from './TenantTableCells'
import type { BuildingData, BuildingRecord, CollectionName, CollectionPage, Person } from '../types'

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
  return <tr>
    {page === 'contacts' && <ContactTableCells person={row as Person} />}
    {page === 'tenants' && <TenantTableCells tenancy={row as Extract<BuildingRecord, { personId: string; startDate: string }>} people={people} getApartmentName={getApartmentName} />}
    {page === 'payments' && <PaymentTableCells payment={row as Extract<BuildingRecord, { fromMonth: string }>} getPersonName={getPersonName} getApartmentName={getApartmentName} />}
    {page === 'expenses' && <ExpenseTableCells expense={row as Extract<BuildingRecord, { vendor: string }>} getPersonName={getPersonName} />}
    {page === 'issues' && <IssueTableCells issue={row as Extract<BuildingRecord, { priority: string }>} getPersonName={getPersonName} getApartmentName={getApartmentName} />}
    <td className="row-action-cell"><span className="row-actions"><button className="row-edit" title="עריכת רשומה" aria-label="עריכת רשומה" onClick={() => onEdit(row)}><Pencil size={15} /></button><button className="row-delete" title="מחיקת רשומה" aria-label="מחיקת רשומה" onClick={() => onDelete(collection, row.id)}><Trash2 size={15} /></button></span></td>
  </tr>
}