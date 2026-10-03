import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { PlannedExpense } from '../types'
import { formatMoney } from '../lib/formatters'

type PlanningPageProps = {
  monthlyPaymentAmount: number
  plannedExpenses: PlannedExpense[]
  onAdd: () => void
  onEdit: (expense: PlannedExpense) => void
  onDelete: (id: string) => void
}

function cadence(intervalMonths: number) {
  return `${intervalMonths === 1 ? 'כל חודש' : `כל ${intervalMonths} חודשים`} · ${12 / intervalMonths} בשנה`
}

export default function PlanningPage({ monthlyPaymentAmount, plannedExpenses, onAdd, onEdit, onDelete }: PlanningPageProps) {
  const yearlyIncome = monthlyPaymentAmount * 12
  const yearlyExpenses = plannedExpenses.reduce((total, expense) => total + expense.amount * (12 / expense.intervalMonths), 0)
  const balance = yearlyIncome - yearlyExpenses

  return <>
    <section className="stats-grid planning-summary" aria-label="סיכום תקציב שנתי">
      <article className="stat-card stat-blue"><div className="stat-top"><span>הכנסה שנתית</span></div><strong className="stat-value">{formatMoney(yearlyIncome)}</strong><span className="stat-caption">{formatMoney(monthlyPaymentAmount)} בכל חודש</span></article>
      <article className="stat-card stat-peach"><div className="stat-top"><span>הוצאות שנתיות</span></div><strong className="stat-value">{formatMoney(yearlyExpenses)}</strong><span className="stat-caption">לפי התדירות שנבחרה</span></article>
      <article className={`stat-card ${balance < 0 ? 'stat-peach' : 'stat-mint'}`}><div className="stat-top"><span>יתרה שנתית</span></div><strong className={`stat-value ${balance < 0 ? 'balance-negative' : ''}`}>{formatMoney(balance)}</strong><span className="stat-caption">הכנסות פחות הוצאות</span></article>
    </section>

    <section className="panel collection-panel planning-panel">
      <div className="panel-heading"><div><h2>תכנון שנתי</h2><p>הסכומים השנתיים מחושבים לפי מספר הפעמים בשנה.</p></div><button className="primary-button" onClick={onAdd}><Plus size={16} />הוספת הוצאה מתוכננת</button></div>
      <div className="table-wrap"><table className="full-table planning-table"><thead><tr><th>סוג</th><th>תיאור</th><th>תדירות</th><th>סכום למחזור</th><th>סכום שנתי</th><th>פעולות</th></tr></thead><tbody>
        <tr className="planning-income-row"><td><span className="planning-kind planning-kind-income">הכנסה</span></td><td><span className="table-primary">תשלומי ועד הבית</span></td><td>{cadence(1)}</td><td className="money-cell">{formatMoney(monthlyPaymentAmount)}</td><td className="money-cell">{formatMoney(yearlyIncome)}</td><td className="planning-fixed-row">—</td></tr>
        {plannedExpenses.map((expense) => <tr key={expense.id}>
          <td><span className="planning-kind planning-kind-expense">הוצאה</span></td>
          <td><span className="table-primary">{expense.title}</span></td>
          <td>{cadence(expense.intervalMonths)}</td>
          <td className="money-cell">{formatMoney(expense.amount)}</td>
          <td className="money-cell">{formatMoney(expense.amount * (12 / expense.intervalMonths))}</td>
          <td className="row-action-cell"><span className="row-actions"><button className="row-edit" title="עריכת הוצאה מתוכננת" aria-label={`עריכת ${expense.title}`} onClick={() => onEdit(expense)}><Pencil size={15} /></button><button className="row-delete" title="מחיקת הוצאה מתוכננת" aria-label={`מחיקת ${expense.title}`} onClick={() => onDelete(expense.id)}><Trash2 size={15} /></button></span></td>
        </tr>)}
      </tbody></table></div>
    </section>
  </>
}