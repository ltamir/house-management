import StatusBadge from './StatusBadge'
import { BUILDING_PAYMENT_LOCATION, paymentMethodLabels, type Payment } from '../types'
import { formatDate, formatMoney, formatMonthRange } from '../lib/formatters'

type PaymentTableCellsProps = {
  payment: Payment
  getPersonName: (id: string) => string
  getApartmentName: (id: string) => string
}

export default function PaymentTableCells({ payment, getPersonName, getApartmentName }: PaymentTableCellsProps) {
  return <>
    <td>{payment.personId ? getPersonName(payment.personId) : '—'}</td>
    <td>{payment.apartmentId === BUILDING_PAYMENT_LOCATION ? 'בניין' : getApartmentName(payment.apartmentId)}</td>
    <td>{formatMonthRange(payment.fromMonth, payment.toMonth)}</td>
    <td>{formatDate(payment.date)}</td>
    <td>{payment.paymentMethod ? paymentMethodLabels[payment.paymentMethod] : '—'}</td>
    <td><StatusBadge value={payment.status} /></td>
    <td className="money-cell">{formatMoney(payment.amount)}</td>
  </>
}