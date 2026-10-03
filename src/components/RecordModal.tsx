import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import { recordForms } from '../config/recordForms'
import { BUILDING_PAYMENT_LOCATION, type BuildingData, type BuildingRecord, type CollectionPage } from '../types'
import { monthNow, today } from '../lib/formatters'
import { singularLabels } from '../config/recordForms'
import { isActiveTenancy } from '../lib/tenantViews'

type RecordModalProps = {
  page: CollectionPage
  building: BuildingData
  monthlyPaymentAmount: number
  record?: BuildingRecord
  initialValues?: Record<string, string>
  onCreatePerson?: () => void
  onClose: () => void
  onSubmit: (values: Record<string, string>) => void
}

export default function RecordModal({ page, building, monthlyPaymentAmount, record, initialValues, onCreatePerson, onClose, onSubmit }: RecordModalProps) {
  const fields = recordForms[page].fields.map((field) => ({
    ...field,
    options: field.name === 'apartmentId' && page === 'payments'
      ? [...building.apartments.map((apartment) => ({ value: apartment.id, label: `דירה ${apartment.number}` })), { value: BUILDING_PAYMENT_LOCATION, label: 'בניין' }]
      : field.name === 'apartmentId'
      ? building.apartments.map((apartment) => ({ value: apartment.id, label: `דירה ${apartment.number}` }))
      : field.options,
  }))
  const [values, setValues] = useState<Record<string, string>>(() => {
    const recordValues = record as unknown as Record<string, unknown> | undefined
    return Object.fromEntries(fields.map((field) => [
      field.name,
      recordValues?.[field.name] !== undefined ? field.type === 'checkbox-group' ? JSON.stringify(recordValues[field.name]) : String(recordValues[field.name])
        : initialValues?.[field.name] !== undefined ? initialValues[field.name]
        : page === 'payments' && field.name === 'amount' && monthlyPaymentAmount > 0 ? String(monthlyPaymentAmount)
        : field.defaultEmpty ? ''
        : field.type === 'date' ? today()
          : field.type === 'month' ? monthNow()
            : field.type === 'checkbox' ? 'false'
            : field.type === 'checkbox-group' ? '[]'
            : ['status', 'priority', 'category'].includes(field.name) ? field.options?.[0]?.value || ''
              : '',
    ]))
  })
  const [error, setError] = useState('')

  function optionsForField(field: (typeof fields)[number]) {
    if (field.name === 'personId' && page === 'tenants') {
      return building.people.map((person) => ({ value: person.id, label: person.name }))
    }
    if (field.name === 'personId' && page === 'payments') {
      if (values.apartmentId === BUILDING_PAYMENT_LOCATION) return []
      const activePersonIds = new Set(building.tenancies.filter((tenancy) => isActiveTenancy(tenancy) && (!values.apartmentId || tenancy.apartmentId === values.apartmentId)).map((tenancy) => tenancy.personId))
      return building.people.filter((person) => activePersonIds.has(person.id)).map((person) => ({ value: person.id, label: person.name }))
    }
    if (field.name === 'supplierPersonId') {
      return building.people.filter((person) => person.roles.includes('supplier')).map((person) => ({ value: person.id, label: person.name }))
    }
    if (field.name === 'contactPersonId') {
      return building.people.map((person) => ({ value: person.id, label: person.name }))
    }
    return field.options
  }

  function toggleOption(fieldName: string, optionValue: string, checked: boolean) {
    const selected = new Set(JSON.parse(values[fieldName] || '[]') as string[])
    if (checked) selected.add(optionValue)
    else selected.delete(optionValue)
    setValues({ ...values, [fieldName]: JSON.stringify([...selected]) })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    for (const field of fields) {
      if (field.required && !values[field.name]) { setError(`צריך למלא: ${field.label}`); return }
      if (field.type === 'number' && values[field.name] && Number(values[field.name]) < 0) { setError(`${field.label} לא יכול להיות שלילי`); return }
    }
    if (page === 'payments' && values.apartmentId !== BUILDING_PAYMENT_LOCATION && !values.personId) {
      setError('צריך לבחור דייר/ת עבור התשלום')
      return
    }
    if (page === 'tenants' && values.endDate && values.endDate < values.startDate) {
      setError('תאריך היציאה לא יכול להיות לפני תאריך הכניסה')
      return
    }
    if (page === 'payments' && values.toMonth < values.fromMonth) {
      setError('חודש הסיום לא יכול להיות לפני חודש ההתחלה')
      return
    }
    setError('')
    onSubmit(values)
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · ניהול בניין</span><h2 id="modal-title">{record ? 'עריכת' : 'הוספת'} {singularLabels[page]}</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
    <form onSubmit={submit}><div className="form-fields">{fields.map((field) => field.type === 'checkbox-group' ? <div className="form-field form-field-checkbox-group" key={field.name}><span>{field.label}</span><div className="checkbox-group-options">{field.options?.map((option) => <label key={option.value}><input type="checkbox" checked={(JSON.parse(values[field.name] || '[]') as string[]).includes(option.value)} onChange={(event) => toggleOption(field.name, option.value, event.target.checked)} /><span>{option.label}</span></label>)}</div></div> : <label className={field.type === 'checkbox' ? 'form-field form-field-toggle' : 'form-field'} key={field.name}><span>{field.label}{field.required && <b> *</b>}</span>{field.type === 'checkbox' ? <input type="checkbox" checked={values[field.name] === 'true'} onChange={(event) => setValues({ ...values, [field.name]: String(event.target.checked) })} /> : field.options ? <><select required={field.required} value={values[field.name]} onChange={(event) => setValues(field.name === 'apartmentId' && page === 'payments' ? { ...values, apartmentId: event.target.value, personId: '' } : { ...values, [field.name]: event.target.value })}><option value="">בחירה...</option>{optionsForField(field)?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>{page === 'tenants' && field.name === 'personId' && onCreatePerson && <button type="button" className="text-link" onClick={onCreatePerson}>הוספת איש קשר חדש</button>}</> : <input type={field.type || 'text'} required={field.required} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 'any' : undefined} value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}</label>)}</div>
      {error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ביטול</button><button type="submit" className="primary-button"><Check size={16} />שמירה</button></div></form>
  </section></div>
}