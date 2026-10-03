import { Eye, Pencil, Trash2, Wallet } from 'lucide-react'
import type { Apartment, Tenant } from '../types'
import { formatMoney } from '../lib/formatters'

type ApartmentTileProps = {
  apartment: Apartment
  tenants: Tenant[]
  annualPaidTotal: number
  onView: (apartment: Apartment) => void
  onEdit: (apartment: Apartment) => void
  onAddPayment: (apartmentId: string, personId: string) => void
  onDelete: () => void
}

export default function ApartmentTile({ apartment, tenants, annualPaidTotal, onView, onEdit, onAddPayment, onDelete }: ApartmentTileProps) {
  return <article className="apartment-tile">
    <div className="apartment-tile-heading"><span className="apartment-tile-floor">קומה {apartment.floor}</span><strong>דירה {apartment.number}</strong></div>
    {(apartment.rooms || apartment.size) && <div className="apartment-tile-row"><span>פרטים</span><strong>{[apartment.rooms && `${apartment.rooms} חדרים`, apartment.size && `${apartment.size} מ״ר`].filter(Boolean).join(' · ')}</strong></div>}
    <div className="apartment-tile-row"><span>דיירים</span><strong className="apartment-tile-tenants">{tenants.length ? tenants.map((tenant) => tenant.name).join(', ') : 'פנויה'}</strong></div>
    <div className="apartment-tile-row apartment-tile-total"><span>שולם השנה</span><strong>{formatMoney(annualPaidTotal)}</strong></div>
    <div className="apartment-tile-actions"><button className="row-view" title="צפייה בפרטי דירה" aria-label={`צפייה בפרטי דירה ${apartment.number}`} onClick={() => onView(apartment)}><Eye size={15} /></button><button className="row-edit" title="עריכת דירה" aria-label={`עריכת דירה ${apartment.number}`} onClick={() => onEdit(apartment)}><Pencil size={15} /></button><button className="row-payment" title={tenants.length ? 'הוספת תשלום לדייר/ת' : 'אין דיירים בדירה'} aria-label={`הוספת תשלום לדירה ${apartment.number}`} disabled={!tenants.length} onClick={() => tenants[0] && onAddPayment(apartment.id, tenants[0].personId)}><Wallet size={15} /></button><button className="row-delete" title="מחיקת דירה" aria-label={`מחיקת דירה ${apartment.number}`} onClick={onDelete}><Trash2 size={15} /></button></div>
  </article>
}