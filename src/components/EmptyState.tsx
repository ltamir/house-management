import { Plus, type LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  text: string
  action?: string
  onClick?: () => void
  disabled?: boolean
}

export default function EmptyState({ icon: Icon, title, text, action, onClick, disabled = false }: EmptyStateProps) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={20} /></span><strong>{title}</strong><p>{text}</p>{action && onClick && <button className="empty-action" disabled={disabled} onClick={onClick}><Plus size={15} />{action}</button>}</div>
}