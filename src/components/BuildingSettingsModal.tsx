import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import { formatMoney } from '../lib/formatters'

type BuildingSettingsModalProps = {
  monthlyPaymentAmount: number
  onClose: () => void
  onSave: (amount: number) => void
}

export default function BuildingSettingsModal({ monthlyPaymentAmount, onClose, onSave }: BuildingSettingsModalProps) {
  const [amount, setAmount] = useState(String(monthlyPaymentAmount || ''))
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value < 0) {
      setError('יש להזין סכום תקין שאינו שלילי')
      return
    }
    onSave(value)
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="form-modal building-settings-modal" role="dialog" aria-modal="true" aria-labelledby="building-settings-title">
      <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · הגדרות בניין</span><h2 id="building-settings-title">תשלום חודשי לדירה</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
      <form onSubmit={submit}>
        <label className="form-field"><span>סכום חודשי לדירה (₪)</span><input type="number" min="0" step="0.01" required autoFocus value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <p className="building-settings-hint">הסכום ישמש כברירת מחדל בעת רישום תשלום חדש.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ביטול</button><button type="submit" className="primary-button"><Check size={16} />שמירה</button></div>
      </form>
      <span className="sr-only">תעריף נוכחי: {formatMoney(monthlyPaymentAmount)}</span>
    </section>
  </div>
}