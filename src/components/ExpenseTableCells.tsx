import { paymentMethodLabels, type Expense } from '../types'
import { formatDate, formatMoney } from '../lib/formatters'

type ExpenseTableCellsProps = {
  expense: Expense
  getPersonName: (id: string) => string
}

export default function ExpenseTableCells({ expense, getPersonName }: ExpenseTableCellsProps) {
  const supplier = expense.supplierPersonId ? getPersonName(expense.supplierPersonId) : ''
  const supplierDetails = [supplier, expense.vendor].filter(Boolean).join(' · ') || '—'

  return <>
    <td><span className="table-primary">{expense.title}</span></td>
    <td>{expense.category}</td>
    <td>{formatDate(expense.date)}</td>
    <td>{supplierDetails}</td>
    <td>{expense.paymentMethod ? paymentMethodLabels[expense.paymentMethod] : '—'}</td>
    <td className="money-cell">{formatMoney(expense.amount)}</td>
  </>
}