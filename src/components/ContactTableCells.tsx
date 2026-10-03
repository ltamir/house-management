import { personRoleLabels, type Person } from '../types'

type ContactTableCellsProps = {
  person: Person
}

export default function ContactTableCells({ person }: ContactTableCellsProps) {
  const roles = person.roles.map((role) => personRoleLabels[role]).join(', ') || '—'

  return <>
    <td><span className="table-primary">{person.name}</span></td>
    <td>{roles}</td>
    <td dir="ltr" className="ltr-cell">{person.phone || '—'}</td>
    <td dir="ltr" className="ltr-cell">{person.email || '—'}</td>
  </>
}