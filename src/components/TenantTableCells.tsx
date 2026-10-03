import type { BuildingData, Tenancy } from '../types'

type TenantTableCellsProps = {
  tenancy: Tenancy
  people: BuildingData['people']
  getApartmentName: (id: string) => string
}

export default function TenantTableCells({ tenancy, people, getApartmentName }: TenantTableCellsProps) {
  const person = people.find((item) => item.id === tenancy.personId)

  return <>
    <td><span className="table-primary">{person?.name || 'איש קשר לא ידוע'}</span></td>
    <td>{getApartmentName(tenancy.apartmentId)}</td>
    <td>{tenancy.startDate || '—'}</td>
    <td>{tenancy.endDate || 'פעילה'}</td>
    <td dir="ltr" className="ltr-cell">{person?.phone || '—'}</td>
    <td dir="ltr" className="ltr-cell">{person?.email || '—'}</td>
    <td>{tenancy.isOwner ? <span className="owner-badge">בעל/ת הדירה</span> : <span className="muted">דייר/ת</span>}</td>
  </>
}