import { ArrowDownLeft, ArrowUpLeft, Plus } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import type { BuildingData, CollectionPage, Page } from '../types'
import { formatDate, formatMoney } from '../lib/formatters'

type TransactionsPageProps = {
  building: BuildingData
  getTenantName: (id: string) => string
  onAdd: (page: CollectionPage) => void
}

type LedgerEntry = {
  id: string
  date: string
  description: string
  detail: string
  kind: 'payment' | 'expense'
  status?: string
  amount: number
  balanceChange: number
  balance: number
}

export default function TransactionsPage({ building, getTenantName, onAdd }: TransactionsPageProps) {
  const chronological: LedgerEntry[] = [
    ...building.payments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.date,
      description: getTenantName(payment.tenantId),
      detail: 'תשלום ועד הבית',
      kind: 'payment' as const,
      status: payment.status,
      amount: payment.amount,
      balanceChange: payment.status === 'שולם' ? payment.amount : 0,
      balance: 0,
    })),
    ...building.expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      description: expense.title,
      detail: expense.category,
      kind: 'expense' as const,
      amount: expense.amount,
      balanceChange: -expense.amount,
      balance: 0,
    })),
  ].sort((first, second) => first.date.localeCompare(second.date) || first.kind.localeCompare(second.kind) || first.id.localeCompare(second.id))

  let runningBalance = 0
  const entries = chronological.map((entry) => {
    runningBalance += entry.balanceChange
    return { ...entry, balance: runningBalance }
  }).reverse()

  return <>
    <section className="transactions-toolbar" aria-label="פעולות ויתרה">
      <div className="balance-summary"><span>יתרה נוכחית</span><strong className={runningBalance < 0 ? 'balance-negative' : ''}>{formatMoney(runningBalance)}</strong></div>
      <div className="transaction-actions">
        <button className="secondary-button transaction-add-payment" onClick={() => onAdd('payments')}><ArrowDownLeft size={16} />הוספת תשלום</button>
        <button className="primary-button" onClick={() => onAdd('expenses')}><Plus size={16} />הוספת הוצאה</button>
      </div>
    </section>

    <section className="panel transactions-panel">
      <div className="collection-toolbar"><div className="record-count">{entries.length} תנועות</div><span className="transaction-sort-label">ממוינות לפי תאריך · החדשות תחילה</span></div>
      {entries.length ? <div className="table-wrap"><table className="full-table transactions-table"><thead><tr><th>תאריך</th><th>תנועה</th><th>סטטוס</th><th>סכום</th><th>יתרה לאחר התנועה</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}>
        <td>{formatDate(entry.date)}</td>
        <td><span className="table-primary">{entry.description}</span><span className="table-secondary">{entry.detail}</span></td>
        <td>{entry.status ? <StatusBadge value={entry.status} /> : <span className="transaction-kind">הוצאה</span>}</td>
        <td className={`money-cell ${entry.kind === 'payment' && entry.status === 'שולם' ? 'transaction-in' : entry.kind === 'expense' ? 'transaction-out' : ''}`}>{entry.kind === 'expense' ? '−' : entry.status === 'שולם' ? '+' : ''}{formatMoney(entry.amount)}</td>
        <td className={`money-cell ${entry.balance < 0 ? 'balance-negative' : ''}`}>{formatMoney(entry.balance)}</td>
      </tr>)}</tbody></table></div> : <EmptyState icon={ArrowUpLeft} title="אין עדיין תנועות" text="תשלומים והוצאות יופיעו כאן לפי תאריך." action="הוספת הוצאה" onClick={() => onAdd('expenses')} />}
    </section>
  </>
}