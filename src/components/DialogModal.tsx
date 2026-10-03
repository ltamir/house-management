import { Check, X } from 'lucide-react'

type DialogModalProps = {
  type: 'alert' | 'confirm'
  title: string
  message: string
  onClose: () => void
  onConfirm?: () => void
}

export default function DialogModal({ type, title, message, onClose, onConfirm }: DialogModalProps) {
  const isConfirm = type === 'confirm'

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="form-modal message-modal" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message">
      <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · ניהול בניין</span><h2 id="dialog-title">{title}</h2></div><button type="button" className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
      <p id="dialog-message" className="dialog-message">{message}</p>
      <div className="modal-actions">
        {isConfirm ? <><button type="button" className="secondary-button" autoFocus onClick={onClose}>לא</button><button type="button" className="danger-button" onClick={onConfirm}><Check size={16} />כן</button></> : <button type="button" className="primary-button" autoFocus onClick={onClose}>אישור</button>}
      </div>
    </section>
  </div>
}