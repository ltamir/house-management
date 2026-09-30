import { useState, type FormEvent } from 'react'
import { Droplets, Pencil, X, Zap } from 'lucide-react'
import type { Apartment, Payment, Tenant, UtilityKind, UtilityPayment } from '../types'
import { formatDate, formatMoney, today } from '../lib/formatters'

type ApartmentDetailsModalProps = {
  apartment: Apartment
  tenants: Tenant[]
  committeePayments: Payment[]
  utilities: Record<UtilityKind, UtilityPayment[]>
  onClose: () => void
  onAddUtilityPayment: (type: UtilityKind, values: Omit<UtilityPayment, 'id' | 'apartmentId' | 'createdAt'>) => void
  onUpdateUtilityPayment: (type: UtilityKind, id: string, values: Omit<UtilityPayment, 'id' | 'apartmentId' | 'createdAt'>) => void
}

export default function ApartmentDetailsModal({ apartment, tenants, committeePayments, utilities, onClose, onAddUtilityPayment, onUpdateUtilityPayment }: ApartmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<UtilityKind>('water')
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [meterReading, setMeterReading] = useState('')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [error, setError] = useState('')
  const apartmentPayments = utilities[activeTab]
    .filter((payment) => payment.apartmentId === apartment.id)
    .sort((first, second) => second.toDate.localeCompare(first.toDate) || second.fromDate.localeCompare(first.fromDate) || second.createdAt.localeCompare(first.createdAt))
  const paidCommitteeTotal = committeePayments
    .filter((payment) => payment.status === 'שולם')
    .reduce((total, payment) => total + payment.amount, 0)
  const utilityLabel = activeTab === 'water' ? 'מים' : 'חשמל'
  const meterUnit = activeTab === 'water' ? 'מ״ק' : 'קוט״ש'

  function resetForm() {
    setEditingPaymentId(null)
    setAmount('')
    setMeterReading('')
    setFromDate(today())
    setToDate(today())
    setError('')
  }

  function editPayment(payment: UtilityPayment) {
    setEditingPaymentId(payment.id)
    setAmount(String(payment.amount))
    setMeterReading(String(payment.meterReading))
    setFromDate(payment.fromDate)
    setToDate(payment.toDate)
    setError('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (toDate < fromDate) {
      setError('תאריך הסיום צריך להיות אחרי תאריך ההתחלה')
      return
    }
    const values = {
      amount: Number(amount),
      meterReading: Number(meterReading),
      fromDate,
      toDate,
    }
    if (editingPaymentId) onUpdateUtilityPayment(activeTab, editingPaymentId, values)
    else onAddUtilityPayment(activeTab, values)
    resetForm()
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="form-modal apartment-details-modal" role="dialog" aria-modal="true" aria-labelledby="apartment-modal-title">
      <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · פרטי נכס</span><h2 id="apartment-modal-title">דירה {apartment.number}</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>

      <div className="apartment-summary">
        <div><span>קומה</span><strong>{apartment.floor}</strong></div>
        <div><span>חדרים</span><strong>{apartment.rooms}</strong></div>
        <div><span>דיירים</span><strong>{tenants.length ? tenants.map((tenant) => tenant.name).join(', ') : 'פנויה'}</strong></div>
      </div>

      <div className="apartment-total"><span>תשלומי ועד ששולמו</span><strong>{formatMoney(paidCommitteeTotal)}</strong><small>{committeePayments.filter((payment) => payment.status === 'שולם').length} תשלומים</small></div>

      <div className="utility-tabs" role="tablist" aria-label="חשבונות דירה">
        <button type="button" role="tab" aria-selected={activeTab === 'water'} className={activeTab === 'water' ? 'utility-tab utility-tab-active' : 'utility-tab'} onClick={() => { setActiveTab('water'); resetForm() }}><Droplets size={16} />מים</button>
        <button type="button" role="tab" aria-selected={activeTab === 'electricity'} className={activeTab === 'electricity' ? 'utility-tab utility-tab-active' : 'utility-tab'} onClick={() => { setActiveTab('electricity'); resetForm() }}><Zap size={16} />חשמל</button>
      </div>

      <form className="utility-form" onSubmit={submit}>
        <div className="utility-form-heading"><strong>{editingPaymentId ? 'עריכת' : 'הוספת'} חשבון {utilityLabel}</strong><span>הקריאה הנוכחית: {meterUnit}</span></div>
        <div className="utility-form-fields">
          <label className="form-field"><span>סכום (₪) *</span><input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <label className="form-field"><span>קריאת מונה ({meterUnit}) *</span><input type="number" min="0" step="any" required value={meterReading} onChange={(event) => setMeterReading(event.target.value)} /></label>
          <label className="form-field"><span>מתאריך *</span><input type="date" required value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
          <label className="form-field"><span>עד תאריך *</span><input type="date" required value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="utility-form-actions">{editingPaymentId && <button type="button" className="secondary-button" onClick={resetForm}>ביטול עריכה</button>}<button type="submit" className="primary-button">{editingPaymentId ? 'שמירת שינויים' : 'הוספת חשבון'}</button></div>
      </form>

      <section className="utility-history" aria-live="polite">
        <div className="utility-history-heading"><h3>חשבונות {utilityLabel}</h3><span>{apartmentPayments.length} רשומות</span></div>
        {apartmentPayments.length ? <div className="utility-history-scroll"><table className="utility-table"><thead><tr><th>תקופה</th><th>קריאת מונה</th><th>סכום</th><th>פעולות</th></tr></thead><tbody>{apartmentPayments.map((payment) => <tr key={payment.id}><td>{formatDate(payment.fromDate)} – {formatDate(payment.toDate)}</td><td>{payment.meterReading.toLocaleString('he-IL')} {meterUnit}</td><td className="money-cell">{formatMoney(payment.amount)}</td><td><button type="button" className="utility-row-edit" aria-label={`עריכת חשבון ${formatDate(payment.fromDate)}`} title="עריכת חשבון" onClick={() => editPayment(payment)}><Pencil size={14} /></button></td></tr>)}</tbody></table></div> : <p className="utility-empty">אין עדיין חשבונות {utilityLabel} לדירה הזו.</p>}
      </section>
    </section>
  </div>
}