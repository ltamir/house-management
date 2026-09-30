import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import { recordForms } from '../config/recordForms'
import type { BuildingData, BuildingRecord, CollectionPage } from '../types'
import { monthNow, today } from '../lib/formatters'
import { singularLabels } from '../config/recordForms'

type RecordModalProps = {
  page: CollectionPage
  building: BuildingData
  monthlyPaymentAmount: number
  record?: BuildingRecord
  onClose: () => void
  onSubmit: (values: Record<string, string>) => void
}

export default function RecordModal({ page, building, monthlyPaymentAmount, record, onClose, onSubmit }: RecordModalProps) {
  const fields = recordForms[page].fields.map((field) => ({
    ...field,
    options: field.name === 'apartmentId'
      ? building.apartments.map((apartment) => ({ value: apartment.id, label: `דירה ${apartment.number}` }))
      : field.name === 'tenantId'
        ? building.tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))
        : field.options,
  }))
  const [values, setValues] = useState<Record<string, string>>(() => {
    const recordValues = record as unknown as Record<string, string | number> | undefined
    return Object.fromEntries(fields.map((field) => [
      field.name,
      recordValues?.[field.name] !== undefined ? String(recordValues[field.name])
        : page === 'payments' && field.name === 'amount' && monthlyPaymentAmount > 0 ? String(monthlyPaymentAmount)
        : field.type === 'date' ? today()
          : field.type === 'month' ? monthNow()
            : field.type === 'checkbox' ? 'false'
            : ['status', 'priority', 'category'].includes(field.name) ? field.options?.[0]?.value || ''
              : '',
    ]))
  })
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    for (const field of fields) {
      if (field.required && !values[field.name]) { setError(`צריך למלא: ${field.label}`); return }
      if (field.type === 'number' && values[field.name] && Number(values[field.name]) < 0) { setError(`${field.label} לא יכול להיות שלילי`); return }
    }
    setError('')
    onSubmit(values)
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · ניהול בניין</span><h2 id="modal-title">{record ? 'עריכת' : 'הוספת'} {singularLabels[page]}</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
    <form onSubmit={submit}><div className="form-fields">{fields.map((field) => <label className={field.type === 'checkbox' ? 'form-field form-field-toggle' : 'form-field'} key={field.name}><span>{field.label}{field.required && <b> *</b>}</span>{field.type === 'checkbox' ? <input type="checkbox" checked={values[field.name] === 'true'} onChange={(event) => setValues({ ...values, [field.name]: String(event.target.checked) })} /> : field.options ? <select required={field.required} value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}><option value="">בחירה...</option>{field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : <input type={field.type || 'text'} required={field.required} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 'any' : undefined} value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}</label>)}</div>
      {error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ביטול</button><button type="submit" className="primary-button"><Check size={16} />שמירה</button></div></form>
  </section></div>
}