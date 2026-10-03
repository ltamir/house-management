import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { PlannedExpense } from '../types'

type PlannedExpenseModalProps = {
  expense?: PlannedExpense
  onClose: () => void
  onSubmit: (values: Omit<PlannedExpense, 'id'>) => void
}

export default function PlannedExpenseModal({ expense, onClose, onSubmit }: PlannedExpenseModalProps) {
  const [title, setTitle] = useState(expense?.title || '')
  const [intervalMonths, setIntervalMonths] = useState(String(expense?.intervalMonths || 1))
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedAmount = Number(amount)
    if (!title.trim()) { setError('צריך למלא תיאור הוצאה'); return }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) { setError('הסכום צריך להיות גדול מאפס'); return }
    onSubmit({ title: title.trim(), intervalMonths: Number(intervalMonths) as PlannedExpense['intervalMonths'], amount: parsedAmount })
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="planned-expense-title">
      <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · תכנון תקציב</span><h2 id="planned-expense-title">{expense ? 'עריכת הוצאה מתוכננת' : 'הוספת הוצאה מתוכננת'}</h2></div><button type="button" className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
      <form onSubmit={submit}><div className="form-fields">
        <label className="form-field"><span>תיאור ההוצאה *</span><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="form-field"><span>תדירות *</span><select value={intervalMonths} onChange={(event) => setIntervalMonths(event.target.value)}><option value="1">כל חודש</option><option value="2">כל חודשיים</option><option value="3">כל 3 חודשים</option><option value="4">כל 4 חודשים</option><option value="12">פעם בשנה</option></select></label>
        <label className="form-field"><span>סכום למחזור (₪) *</span><input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ביטול</button><button type="submit" className="primary-button"><Check size={16} />שמירה</button></div></form>
    </section>
  </div>
}