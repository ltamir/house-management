import {
  ArrowDownLeft,
  ArrowUpLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  ClipboardList,
  DoorOpen,
  Plus,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import type { BuildingData, CollectionPage, Page, Payment } from '../types'
import { formatDate, formatMoney, monthNow } from '../lib/formatters'

type OverviewPageProps = {
  building: BuildingData
  currentMonthPayments: Payment[]
  monthlyIncome: number
  monthlyExpenses: number
  openIssues: BuildingData['issues']
  getApartmentName: (id: string) => string
  getTenantName: (id: string) => string
  onNavigate: (page: Page) => void
  onAdd: (page: CollectionPage) => void
}

export default function OverviewPage({ building, currentMonthPayments, monthlyIncome, monthlyExpenses, openIssues, getApartmentName, getTenantName, onNavigate, onAdd }: OverviewPageProps) {
  const stats: { label: string; value: string; caption: string; icon: LucideIcon; color: string }[] = [
    { label: 'דירות בבניין', value: String(building.apartments.length), caption: `${building.tenants.length} דיירים רשומים`, icon: DoorOpen, color: 'mint' },
    { label: 'גבייה החודש', value: formatMoney(monthlyIncome), caption: `${currentMonthPayments.filter((item) => item.status === 'שולם').length} תשלומים התקבלו`, icon: ArrowDownLeft, color: 'blue' },
    { label: 'הוצאות החודש', value: formatMoney(monthlyExpenses), caption: `${building.expenses.filter((item) => item.date.slice(0, 7) === monthNow()).length} הוצאות נרשמו`, icon: ArrowUpLeft, color: 'peach' },
    { label: 'ממתינות לטיפול', value: String(openIssues.length), caption: openIssues.some((issue) => issue.priority === 'דחופה') ? 'כולל תקלה דחופה' : 'תקלות פתוחות בבניין', icon: CircleAlert, color: 'yellow' },
  ]
  const recentPayments = [...building.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  const recentIssues = [...openIssues].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const monthName = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date())

  return <>
    <section className="welcome-banner">
      <div className="welcome-copy"><div className="welcome-kicker"><span className="live-dot" /> הבית מתעדכן, הכול נשאר בשליטה</div><h2>שלום, ועד הבית <span>👋</span></h2><p>תמונת המצב של הבניין שלך, בלי לחפש בוואטסאפ.</p><div className="welcome-month"><CalendarDays size={14} />{monthName}</div></div>
      <div className="welcome-photo" role="img" aria-label="בניין מגורים מוקף עצים"><div className="photo-caption"><Building2 size={14} />הבניין שלנו</div></div>
    </section>

    <section className="stats-grid" aria-label="נתוני הבניין">
      {stats.map(({ label, value, caption, icon: Icon, color }, index) => <article className={`stat-card stat-${color}`} key={label} style={{ animationDelay: `${index * 65}ms` }}>
        <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17} strokeWidth={1.8} /></span></div><strong className="stat-value">{value}</strong><span className="stat-caption">{caption}</span>
      </article>)}
    </section>

    <div className="dashboard-columns">
      <section className="panel activity-panel">
        <div className="panel-heading"><div><h2>תנועות אחרונות</h2><p>התשלומים שהתקבלו מהדיירים</p></div><button className="text-link" onClick={() => onNavigate('payments')}>כל התשלומים<ChevronLeft size={15} /></button></div>
        {recentPayments.length ? <div className="table-wrap"><table><thead><tr><th>דייר / דירה</th><th>תאריך</th><th>סטטוס</th><th>סכום</th></tr></thead><tbody>{recentPayments.map((payment) => {
          const tenant = building.tenants.find((item) => item.id === payment.tenantId)
          return <tr key={payment.id}><td><span className="table-primary">{getTenantName(payment.tenantId)}</span><span className="table-secondary">{tenant ? getApartmentName(tenant.apartmentId) : '—'}</span></td><td>{formatDate(payment.date)}</td><td><StatusBadge value={payment.status} /></td><td className="money-cell">{formatMoney(payment.amount)}</td></tr>
        })}</tbody></table></div> : <EmptyState icon={Wallet} title="עדיין אין תשלומים" text="כשתירשם גבייה, היא תופיע כאן." action="רישום תשלום" onClick={() => onAdd('payments')} disabled={!building.tenants.length} />}
      </section>

      <section className="panel issues-panel">
        <div className="panel-heading"><div><h2>צריך טיפול</h2><p>{openIssues.length ? `${openIssues.length} פריטים פתוחים` : 'הכול מטופל כרגע'}</p></div><button className="round-add" aria-label="דיווח על תקלה" title="דיווח על תקלה" onClick={() => onAdd('issues')}><Plus size={17} /></button></div>
        {recentIssues.length ? <div className="issue-list">{recentIssues.map((issue) => <div className="issue-row" key={issue.id}><span className={`issue-mark ${issue.priority === 'דחופה' ? 'issue-mark-urgent' : ''}`}><Wrench size={16} /></span><span className="issue-copy"><strong>{issue.title}</strong><small>{getApartmentName(issue.apartmentId)} · {formatDate(issue.date)}</small></span><span className={`priority-text ${issue.priority === 'דחופה' ? 'priority-urgent' : ''}`}>{issue.priority}</span></div>)}</div> : <EmptyState icon={Check} title="אין תקלות פתוחות" text="אפשר לנשום, כרגע הכול בסדר." action="דיווח על תקלה" onClick={() => onAdd('issues')} disabled={!building.apartments.length} />}
        {openIssues.length > 3 && <button className="text-link issue-all-link" onClick={() => onNavigate('issues')}>לכל התקלות<ChevronLeft size={15} /></button>}
      </section>
    </div>

    <section className="quick-actions"><div className="quick-label"><span>קיצורי דרך</span><span className="quick-rule" /></div><div className="quick-buttons">
      <button className="quick-action" onClick={() => onAdd('tenants')}><span className="quick-icon quick-tenant"><Users size={18} /></span><span>הוספת דייר</span><Plus size={15} className="quick-plus" /></button>
      <button className="quick-action" onClick={() => onAdd('payments')}><span className="quick-icon quick-payment"><Wallet size={18} /></span><span>רישום תשלום</span><Plus size={15} className="quick-plus" /></button>
      <button className="quick-action" onClick={() => onAdd('expenses')}><span className="quick-icon quick-expense"><ClipboardList size={18} /></span><span>הוספת הוצאה</span><Plus size={15} className="quick-plus" /></button>
      <button className="quick-action" onClick={() => onAdd('issues')}><span className="quick-icon quick-issue"><Wrench size={18} /></span><span>דיווח על תקלה</span><Plus size={15} className="quick-plus" /></button>
    </div></section>
  </>
}