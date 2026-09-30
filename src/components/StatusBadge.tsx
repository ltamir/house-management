export default function StatusBadge({ value }: { value: string }) {
  const tone = value === 'שולם' || value === 'טופלה' ? 'status-good' : value === 'ממתין' || value === 'פתוחה' ? 'status-waiting' : 'status-progress'
  return <span className={`status-badge ${tone}`}><span />{value}</span>
}