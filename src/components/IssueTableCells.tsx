import StatusBadge from './StatusBadge'
import type { Issue } from '../types'
import { formatDate } from '../lib/formatters'

type IssueTableCellsProps = {
  issue: Issue
  getPersonName: (id: string) => string
  getApartmentName: (id: string) => string
}

export default function IssueTableCells({ issue, getPersonName, getApartmentName }: IssueTableCellsProps) {
  return <>
    <td><span className="table-primary">{issue.title}</span></td>
    <td>{getApartmentName(issue.apartmentId)}</td>
    <td>{issue.contactPersonId ? getPersonName(issue.contactPersonId) : '—'}</td>
    <td>{formatDate(issue.date)}</td>
    <td><span className={`priority-text ${issue.priority === 'דחופה' ? 'priority-urgent' : ''}`}>{issue.priority}</span></td>
    <td><StatusBadge value={issue.status} /></td>
  </>
}