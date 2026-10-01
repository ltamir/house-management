import { useState, type FormEvent } from 'react'
import { Building2, Check, X } from 'lucide-react'

type ApartmentSetupModalProps = {
  onClose: () => void
  onSubmit: (floors: number, apartmentsPerFloor: number) => void
}

export default function ApartmentSetupModal({ onClose, onSubmit }: ApartmentSetupModalProps) {
  const [floors, setFloors] = useState('')
  const [apartmentsPerFloor, setApartmentsPerFloor] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const floorCount = Number(floors)
    const apartmentCount = Number(apartmentsPerFloor)
    const total = floorCount * apartmentCount
    if (!Number.isSafeInteger(floorCount) || floorCount < 1 || !Number.isSafeInteger(apartmentCount) || apartmentCount < 1 || !Number.isSafeInteger(total)) {
      setError('יש להזין מספרים שלמים וחיוביים של קומות ודירות בכל קומה')
      return
    }
    onSubmit(floorCount, apartmentCount)
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="form-modal building-setup-modal" role="dialog" aria-modal="true" aria-labelledby="apartment-setup-title">
      <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · הקמת בניין</span><h2 id="apartment-setup-title">יצירת דירות בבניין</h2></div><button type="button" className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
      <p className="building-setup-hint"><Building2 size={16} />הדירות ימוספרו ברצף, וניצור דייר/ת לדוגמה לכל דירה.</p>
      <form onSubmit={submit}>
        <div className="form-fields">
          <label className="form-field"><span>מספר קומות</span><input type="number" min="1" step="1" required autoFocus value={floors} onChange={(event) => setFloors(event.target.value)} /></label>
          <label className="form-field"><span>דירות בכל קומה</span><input type="number" min="1" step="1" required value={apartmentsPerFloor} onChange={(event) => setApartmentsPerFloor(event.target.value)} /></label>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ביטול</button><button type="submit" className="primary-button"><Check size={16} />יצירת דירות</button></div>
      </form>
    </section>
  </div>
}
