import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  CircleHelp,
  ClipboardList,
  DoorOpen,
  FileText,
  House,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import { loadBuilding, saveBuilding } from './storage'
import type { Apartment, BuildingData, CollectionName, Expense, Issue, Payment, Tenant } from './types'

type Page = 'overview' | 'tenants' | 'apartments' | 'payments' | 'expenses' | 'issues'
type Field = { name: string; label: string; type?: string; required?: boolean; options?: { value: string; label: string }[] }

const navigation: { id: Page; label: string; icon: typeof House }[] = [
  { id: 'overview', label: 'סקירה כללית', icon: LayoutDashboard },
  { id: 'tenants', label: 'דיירים', icon: Users },
  { id: 'apartments', label: 'דירות', icon: DoorOpen },
  { id: 'payments', label: 'תשלומים', icon: Wallet },
  { id: 'expenses', label: 'הוצאות', icon: FileText },
  { id: 'issues', label: 'תקלות', icon: Wrench },
]

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  overview: { title: 'סקירה כללית', subtitle: 'הבית מתנהל טוב יותר כשכולם מעודכנים.' },
  tenants: { title: 'הדיירים שלנו', subtitle: 'אנשי הקשר והדיירים בבניין.' },
  apartments: { title: 'הדירות בבניין', subtitle: 'תפוסה, דיירים ופרטי הדירות.' },
  payments: { title: 'תשלומים', subtitle: 'מעקב אחר תשלומי ועד הבית.' },
  expenses: { title: 'הוצאות', subtitle: 'כל הוצאות הבניין, במקום אחד.' },
  issues: { title: 'תקלות ותחזוקה', subtitle: 'מעקב אחר מה שדורש טיפול בבניין.' },
}

const forms: Record<Exclude<Page, 'overview'>, { collection: CollectionName; fields: Field[] }> = {
  tenants: { collection: 'tenants', fields: [
    { name: 'name', label: 'שם מלא', required: true }, { name: 'phone', label: 'טלפון', type: 'tel', required: true },
    { name: 'email', label: 'דוא״ל', type: 'email' }, { name: 'apartmentId', label: 'דירה', options: [] },
  ] },
  apartments: { collection: 'apartments', fields: [
    { name: 'number', label: 'מספר דירה', required: true }, { name: 'floor', label: 'קומה', type: 'number', required: true },
    { name: 'rooms', label: 'מספר חדרים', type: 'number', required: true },
  ] },
  payments: { collection: 'payments', fields: [
    { name: 'tenantId', label: 'דייר', options: [], required: true }, { name: 'month', label: 'עבור חודש', type: 'month', required: true },
    { name: 'amount', label: 'סכום לתשלום (₪)', type: 'number', required: true }, { name: 'date', label: 'תאריך תשלום', type: 'date' },
    { name: 'status', label: 'סטטוס', options: [{ value: 'שולם', label: 'שולם' }, { value: 'ממתין', label: 'ממתין' }] },
  ] },
  expenses: { collection: 'expenses', fields: [
    { name: 'title', label: 'תיאור ההוצאה', required: true },
    { name: 'category', label: 'קטגוריה', options: ['ניקיון', 'תחזוקה', 'גינון', 'ביטוח', 'חשמל', 'אחר'].map((value) => ({ value, label: value })) },
    { name: 'amount', label: 'סכום (₪)', type: 'number', required: true }, { name: 'date', label: 'תאריך', type: 'date', required: true },
    { name: 'vendor', label: 'ספק / הערה' },
  ] },
  issues: { collection: 'issues', fields: [
    { name: 'title', label: 'תיאור התקלה', required: true }, { name: 'apartmentId', label: 'מיקום / דירה', options: [], required: true },
    { name: 'date', label: 'תאריך דיווח', type: 'date', required: true },
    { name: 'priority', label: 'דחיפות', options: [{ value: 'רגילה', label: 'רגילה' }, { value: 'דחופה', label: 'דחופה' }] },
    { name: 'status', label: 'סטטוס טיפול', options: [{ value: 'פתוחה', label: 'פתוחה' }, { value: 'בטיפול', label: 'בטיפול' }, { value: 'טופלה', label: 'טופלה' }] },
  ] },
}

const pageCollections: Partial<Record<Page, CollectionName>> = {
  tenants: 'tenants', apartments: 'apartments', payments: 'payments', expenses: 'expenses', issues: 'issues',
}

const currency = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })
const formatMoney = (value: number) => currency.format(value)
const today = () => new Date().toISOString().slice(0, 10)
const monthNow = () => today().slice(0, 7)
const makeId = () => crypto.randomUUID()

function App() {
  const [building, setBuilding] = useState<BuildingData>(loadBuilding)
  const [page, setPage] = useState<Page>('overview')
  const [modal, setModal] = useState<Exclude<Page, 'overview'> | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => saveBuilding(building), [building])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const currentMonthPayments = building.payments.filter((payment) => payment.month === monthNow())
  const openIssues = building.issues.filter((issue) => issue.status !== 'טופלה')
  const monthlyIncome = currentMonthPayments.filter((payment) => payment.status === 'שולם').reduce((total, payment) => total + payment.amount, 0)
  const monthlyExpenses = building.expenses.filter((expense) => expense.date.slice(0, 7) === monthNow()).reduce((total, expense) => total + expense.amount, 0)

  function createRecord(formPage: Exclude<Page, 'overview'>, values: Record<string, string>) {
    const collection = forms[formPage].collection
    let record: Tenant | Apartment | Payment | Expense | Issue
    if (collection === 'tenants') record = { id: makeId(), name: values.name, phone: values.phone, email: values.email, apartmentId: values.apartmentId }
    else if (collection === 'apartments') record = { id: makeId(), number: values.number, floor: values.floor, rooms: values.rooms }
    else if (collection === 'payments') record = { id: makeId(), tenantId: values.tenantId, month: values.month, amount: Number(values.amount), date: values.date || today(), status: (values.status || 'ממתין') as Payment['status'] }
    else if (collection === 'expenses') record = { id: makeId(), title: values.title, category: values.category || 'אחר', amount: Number(values.amount), date: values.date, vendor: values.vendor }
    else record = { id: makeId(), title: values.title, apartmentId: values.apartmentId, date: values.date, priority: (values.priority || 'רגילה') as Issue['priority'], status: (values.status || 'פתוחה') as Issue['status'] }

    setBuilding((previous) => ({ ...previous, [collection]: [...previous[collection], record] }))
    setModal(null)
    setNotice('נוסף בהצלחה ונשמר במכשיר')
  }

  function deleteRecord(collection: CollectionName, id: string) {
    if (!window.confirm('למחוק את הרשומה הזו?')) return
    setBuilding((previous) => ({ ...previous, [collection]: previous[collection].filter((record) => record.id !== id) }))
    setNotice('הרשומה הוסרה')
  }

  function getTenantName(id: string) {
    return building.tenants.find((tenant) => tenant.id === id)?.name || 'דייר לא ידוע'
  }

  function getApartmentName(id: string) {
    const apartment = building.apartments.find((item) => item.id === id)
    return apartment ? `דירה ${apartment.number}` : 'שטח משותף'
  }

  function openForm(target: Exclude<Page, 'overview'>) {
    setMobileMenuOpen(false)
    if ((target === 'payments' && building.tenants.length === 0) || (target === 'issues' && building.apartments.length === 0)) {
      setNotice(target === 'payments' ? 'כדאי להוסיף דיירים לפני רישום תשלום' : 'כדאי להוסיף דירות לפני דיווח על תקלה')
      return
    }
    setModal(target)
  }

  const pageAction = (target: Exclude<Page, 'overview'>) => openForm(target)

  return (
    <div className="app-shell" dir="rtl">
      {mobileMenuOpen && <button className="mobile-scrim" aria-label="סגירת תפריט" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#overview" onClick={() => { setPage('overview'); setMobileMenuOpen(false) }}>
          <span className="brand-mark"><House size={21} strokeWidth={2.1} /></span>
          <span className="brand-copy"><strong>הבית שלנו</strong><small>ניהול ועד הבית</small></span>
        </a>
        <div className="side-label">תפריט</div>
        <nav className="navigation" aria-label="תפריט ראשי">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'nav-active' : ''}`} onClick={() => { setPage(id); setSearch(''); setMobileMenuOpen(false) }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === 'issues' && openIssues.length > 0 && <span className="nav-count">{openIssues.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="building-card">
            <span className="building-card-icon"><Building2 size={17} /></span>
            <span><strong>הבניין שלי</strong><small>{building.apartments.length} דירות רשומות</small></span>
          </div>
          <div className="privacy-note"><span className="privacy-dot" />הנתונים שמורים במכשיר הזה בלבד</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" aria-label="פתיחת תפריט" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>הבית שלנו</span><ChevronLeft size={14} /><strong>{pageTitles[page].title}</strong></div>
          <div className="topbar-meta"><span className="today-label"><CalendarDays size={15} />{new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span><span className="user-avatar">ו</span></div>
        </header>

        <div className="content-area">
          <div className="page-heading">
            <div><div className="eyebrow">ניהול בניין <span /> לוח בקרה</div><h1>{pageTitles[page].title}</h1><p>{pageTitles[page].subtitle}</p></div>
            {page !== 'overview' && <button className="primary-button" onClick={() => pageAction(page)}><Plus size={17} />{`הוספת ${singularLabel(page)}`}</button>}
          </div>

          {page === 'overview' ? (
            <Overview
              building={building} currentMonthPayments={currentMonthPayments} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses}
              openIssues={openIssues} getApartmentName={getApartmentName} getTenantName={getTenantName} onNavigate={setPage} onAdd={openForm}
            />
          ) : (
            <CollectionView page={page} building={building} search={search} setSearch={setSearch} getApartmentName={getApartmentName} getTenantName={getTenantName} onDelete={deleteRecord} onAdd={() => openForm(page)} />
          )}
        </div>
        <footer className="page-footer"><span>הבית שלנו</span><span>ניהול נעים, בניין מסודר</span></footer>
      </main>

      {modal && <RecordModal key={modal} page={modal} building={building} onClose={() => setModal(null)} onSubmit={(values) => createRecord(modal, values)} />}
      {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
    </div>
  )
}

function singularLabel(page: Exclude<Page, 'overview'>) {
  const labels = { tenants: 'דייר', apartments: 'דירה', payments: 'תשלום', expenses: 'הוצאה', issues: 'תקלה' }
  return labels[page]
}

function Overview({ building, currentMonthPayments, monthlyIncome, monthlyExpenses, openIssues, getApartmentName, getTenantName, onNavigate, onAdd }: {
  building: BuildingData; currentMonthPayments: Payment[]; monthlyIncome: number; monthlyExpenses: number; openIssues: Issue[];
  getApartmentName: (id: string) => string; getTenantName: (id: string) => string; onNavigate: (page: Page) => void;
  onAdd: (page: Exclude<Page, 'overview'>) => void;
}) {
  const stats = [
    { label: 'דירות בבניין', value: String(building.apartments.length), caption: `${building.tenants.length} דיירים רשומים`, icon: DoorOpen, color: 'mint' },
    { label: 'גבייה החודש', value: formatMoney(monthlyIncome), caption: `${currentMonthPayments.filter((item) => item.status === 'שולם').length} תשלומים התקבלו`, icon: ArrowDownLeft, color: 'blue' },
    { label: 'הוצאות החודש', value: formatMoney(monthlyExpenses), caption: `${building.expenses.filter((item) => item.date.slice(0, 7) === monthNow()).length} הוצאות נרשמו`, icon: ArrowUpLeft, color: 'peach' },
    { label: 'ממתינות לטיפול', value: String(openIssues.length), caption: openIssues.some((issue) => issue.priority === 'דחופה') ? 'כולל תקלה דחופה' : 'תקלות פתוחות בבניין', icon: CircleAlert, color: 'yellow' },
  ]
  const recentPayments = [...building.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  const recentIssues = [...openIssues].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const monthName = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date())

  return (
    <>
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
  )
}

function CollectionView({ page, building, search, setSearch, getApartmentName, getTenantName, onDelete, onAdd }: {
  page: Exclude<Page, 'overview'>; building: BuildingData; search: string; setSearch: (value: string) => void;
  getApartmentName: (id: string) => string; getTenantName: (id: string) => string;
  onDelete: (collection: CollectionName, id: string) => void; onAdd: () => void;
}) {
  const collection = pageCollections[page]!
  const rows = building[collection] as (Tenant | Apartment | Payment | Expense | Issue)[]
  const query = search.trim().toLocaleLowerCase('he')
  const filtered = rows.filter((row) => {
    const names: Record<string, string> = {
      tenants: (row as Tenant).name + ' ' + (row as Tenant).phone + ' ' + getApartmentName((row as Tenant).apartmentId),
      apartments: 'דירה ' + (row as Apartment).number + ' ' + (row as Apartment).floor,
      payments: getTenantName((row as Payment).tenantId) + ' ' + (row as Payment).month,
      expenses: (row as Expense).title + ' ' + (row as Expense).category + ' ' + (row as Expense).vendor,
      issues: (row as Issue).title + ' ' + getApartmentName((row as Issue).apartmentId) + ' ' + (row as Issue).status,
    }
    return names[page].toLocaleLowerCase('he').includes(query)
  })

  return <section className="panel collection-panel">
    <div className="collection-toolbar"><div className="record-count">{filtered.length} {page === 'tenants' ? 'דיירים' : page === 'apartments' ? 'דירות' : page === 'payments' ? 'תשלומים' : page === 'expenses' ? 'הוצאות' : 'תקלות'}</div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="חיפוש..." aria-label="חיפוש ברשומות" /></label></div>
    {filtered.length ? <div className="table-wrap"><table className="full-table"><thead><tr>{page === 'tenants' ? <><th>דייר/ת</th><th>דירה</th><th>טלפון</th><th>דוא״ל</th></> : page === 'apartments' ? <><th>דירה</th><th>קומה</th><th>חדרים</th><th>דייר/ת</th></> : page === 'payments' ? <><th>דייר/ת</th><th>עבור חודש</th><th>תאריך</th><th>סטטוס</th><th>סכום</th></> : page === 'expenses' ? <><th>תיאור</th><th>קטגוריה</th><th>תאריך</th><th>ספק / הערה</th><th>סכום</th></> : <><th>תיאור התקלה</th><th>מיקום</th><th>תאריך</th><th>דחיפות</th><th>סטטוס</th></>}</tr></thead>
      <tbody>{filtered.map((row) => <tr key={row.id}>
        {page === 'tenants' && <><td><span className="table-primary">{(row as Tenant).name}</span></td><td>{getApartmentName((row as Tenant).apartmentId)}</td><td dir="ltr" className="ltr-cell">{(row as Tenant).phone}</td><td dir="ltr" className="ltr-cell">{(row as Tenant).email || '—'}</td></>}
        {page === 'apartments' && <><td><span className="table-primary">דירה {(row as Apartment).number}</span></td><td>{(row as Apartment).floor}</td><td>{(row as Apartment).rooms}</td><td>{building.tenants.find((tenant) => tenant.apartmentId === row.id)?.name || <span className="muted">פנויה</span>}</td></>}
        {page === 'payments' && <><td>{getTenantName((row as Payment).tenantId)}</td><td>{formatMonth((row as Payment).month)}</td><td>{formatDate((row as Payment).date)}</td><td><StatusBadge value={(row as Payment).status} /></td><td className="money-cell">{formatMoney((row as Payment).amount)}</td></>}
        {page === 'expenses' && <><td><span className="table-primary">{(row as Expense).title}</span></td><td>{(row as Expense).category}</td><td>{formatDate((row as Expense).date)}</td><td>{(row as Expense).vendor || '—'}</td><td className="money-cell">{formatMoney((row as Expense).amount)}</td></>}
        {page === 'issues' && <><td><span className="table-primary">{(row as Issue).title}</span></td><td>{getApartmentName((row as Issue).apartmentId)}</td><td>{formatDate((row as Issue).date)}</td><td><span className={`priority-text ${(row as Issue).priority === 'דחופה' ? 'priority-urgent' : ''}`}>{(row as Issue).priority}</span></td><td><StatusBadge value={(row as Issue).status} /></td></>}
        <td className="row-action-cell"><button className="row-delete" title="מחיקת רשומה" aria-label="מחיקת רשומה" onClick={() => onDelete(collection, row.id)}><Trash2 size={15} /></button></td>
      </tr>)}</tbody></table></div> : <EmptyState icon={page === 'tenants' ? Users : page === 'apartments' ? DoorOpen : page === 'payments' ? Wallet : page === 'expenses' ? ClipboardList : CircleHelp} title={query ? 'לא מצאנו תוצאות' : 'אין כאן רשומות עדיין'} text={query ? 'נסו לחפש במילים אחרות.' : `אפשר להתחיל ולהוסיף ${singularLabel(page)} ראשון.`} action={query ? undefined : `הוספת ${singularLabel(page)}`} onClick={query ? undefined : onAdd} />}
  </section>
}

function RecordModal({ page, building, onClose, onSubmit }: { page: Exclude<Page, 'overview'>; building: BuildingData; onClose: () => void; onSubmit: (values: Record<string, string>) => void }) {
  const config = forms[page]
  const fields = config.fields.map((field) => ({ ...field, options: field.name === 'apartmentId' ? building.apartments.map((apartment) => ({ value: apartment.id, label: `דירה ${apartment.number}` })) : field.name === 'tenantId' ? building.tenants.map((tenant) => ({ value: tenant.id, label: tenant.name })) : field.options }))
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.name, field.type === 'date' ? today() : field.type === 'month' ? monthNow() : field.name === 'status' ? field.options?.[0]?.value || '' : field.name === 'priority' ? field.options?.[0]?.value || '' : field.name === 'category' ? field.options?.[0]?.value || '' : ''])))
  const [error, setError] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    for (const field of fields) {
      if (field.required && !values[field.name]) { setError(`צריך למלא: ${field.label}`); return }
      if (field.type === 'number' && values[field.name] && Number(values[field.name]) < 0) { setError(`${field.label} לא יכול להיות שלילי`); return }
    }
    setError('')
    onSubmit(values)
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-header"><div><span className="modal-eyebrow">הבית שלנו · ניהול בניין</span><h2 id="modal-title">הוספת {singularLabel(page)}</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="סגירה"><X size={20} /></button></div>
    <form onSubmit={submit}><div className="form-fields">{fields.map((field) => <label className="form-field" key={field.name}><span>{field.label}{field.required && <b> *</b>}</span>{field.options ? <select required={field.required} value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}><option value="">בחירה...</option>{field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : <input type={field.type || 'text'} required={field.required} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 'any' : undefined} value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}</label>)}</div>
      {error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>ביטול</button><button type="submit" className="primary-button"><Check size={16} />שמירה</button></div></form>
  </section></div>
}

function EmptyState({ icon: Icon, title, text, action, onClick, disabled = false }: { icon: typeof House; title: string; text: string; action?: string; onClick?: () => void; disabled?: boolean }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={20} /></span><strong>{title}</strong><p>{text}</p>{action && onClick && <button className="empty-action" disabled={disabled} onClick={onClick}><Plus size={15} />{action}</button>}</div>
}

function StatusBadge({ value }: { value: string }) {
  const tone = value === 'שולם' || value === 'טופלה' ? 'status-good' : value === 'ממתין' || value === 'פתוחה' ? 'status-waiting' : 'status-progress'
  return <span className={`status-badge ${tone}`}><span />{value}</span>
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(date)
}

function formatMonth(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}-15T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date)
}

export default App