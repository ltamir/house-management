import { useState, type ReactNode } from 'react'
import { Building2, CalendarDays, ChevronLeft, House, Menu, Pencil, Plus } from 'lucide-react'
import { isCollectionPage, navigationItems, pageTitles, singularLabels } from '../config/recordForms'
import { formatMoney } from '../lib/formatters'
import type { CollectionPage, Page } from '../types'

type AppLayoutProps = {
  page: Page
  openIssuesCount: number
  apartmentCount: number
  monthlyPaymentAmount: number
  children: ReactNode
  onNavigate: (page: Page) => void
  onAdd: (page: CollectionPage) => void
  onEditBuilding: () => void
}

export default function AppLayout({ page, openIssuesCount, apartmentCount, monthlyPaymentAmount, children, onNavigate, onAdd, onEditBuilding }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pageInfo = pageTitles[page]

  function navigate(nextPage: Page) {
    onNavigate(nextPage)
    setMobileMenuOpen(false)
  }

  return (
    <div className="app-shell" dir="rtl">
      {mobileMenuOpen && <button className="mobile-scrim" aria-label="סגירת תפריט" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#overview" onClick={() => navigate('overview')}>
          <span className="brand-mark"><House size={21} strokeWidth={2.1} /></span>
          <span className="brand-copy"><strong>הבית שלנו</strong><small>ניהול ועד הבית</small></span>
        </a>
        <div className="side-label">תפריט</div>
        <nav className="navigation" aria-label="תפריט ראשי">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'nav-active' : ''}`} onClick={() => navigate(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === 'issues' && openIssuesCount > 0 && <span className="nav-count">{openIssuesCount}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="building-card">
            <span className="building-card-icon"><Building2 size={17} /></span>
            <span><strong>הבניין שלי</strong><small>{apartmentCount} דירות · {monthlyPaymentAmount > 0 ? `${formatMoney(monthlyPaymentAmount)} לחודש` : 'תשלום חודשי לא הוגדר'}</small></span>
            <button type="button" className="building-settings-button" aria-label="עריכת תשלום חודשי לבניין" title="עריכת תשלום חודשי לבניין" onClick={onEditBuilding}><Pencil size={14} /></button>
          </div>
          <div className="privacy-note"><span className="privacy-dot" />הנתונים שמורים במכשיר הזה בלבד</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" aria-label="פתיחת תפריט" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>הבית שלנו</span><ChevronLeft size={14} /><strong>{pageInfo.title}</strong></div>
          <div className="topbar-meta"><span className="today-label"><CalendarDays size={15} />{new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span><span className="user-avatar">ו</span></div>
        </header>

        <div className="content-area">
          <div className="page-heading">
            <div><div className="eyebrow">ניהול בניין <span /> לוח בקרה</div><h1>{pageInfo.title}</h1><p>{pageInfo.subtitle}</p></div>
            {isCollectionPage(page) && <button className="primary-button" onClick={() => onAdd(page)}><Plus size={17} />{`הוספת ${singularLabels[page]}`}</button>}
          </div>
          {children}
        </div>
        <footer className="page-footer"><span>הבית שלנו</span><span>ניהול נעים, בניין מסודר</span></footer>
      </main>
    </div>
  )
}