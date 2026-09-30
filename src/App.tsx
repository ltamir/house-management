import { useState } from 'react'
import AppLayout from './components/AppLayout'
import RecordModal from './components/RecordModal'
import OverviewPage from './pages/OverviewPage'
import CollectionPageView from './pages/CollectionPage'
import { useBuildingData } from './hooks/useBuildingData'
import { useNotice } from './hooks/useNotice'
import type { CollectionPage, Page } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [modal, setModal] = useState<CollectionPage | null>(null)
  const { notice, showNotice } = useNotice()
  const {
    building,
    addRecord,
    deleteRecord,
    currentMonthPayments,
    openIssues,
    monthlyIncome,
    monthlyExpenses,
    getTenantName,
    getApartmentName,
  } = useBuildingData()

  function openForm(target: CollectionPage) {
    if ((target === 'payments' && building.tenants.length === 0) || (target === 'issues' && building.apartments.length === 0)) {
      showNotice(target === 'payments' ? 'כדאי להוסיף דיירים לפני רישום תשלום' : 'כדאי להוסיף דירות לפני דיווח על תקלה')
      return
    }
    setModal(target)
  }

  function handleSubmit(values: Record<string, string>) {
    if (!modal) return
    addRecord(modal, values)
    setModal(null)
    showNotice('נוסף בהצלחה ונשמר במכשיר')
  }

  function handleDelete(collection: Parameters<typeof deleteRecord>[0], id: string) {
    if (!window.confirm('למחוק את הרשומה הזו?')) return
    deleteRecord(collection, id)
    showNotice('הרשומה הוסרה')
  }

  return <>
    <AppLayout page={page} openIssuesCount={openIssues.length} apartmentCount={building.apartments.length} onNavigate={setPage} onAdd={openForm}>
      {page === 'overview' ? <OverviewPage
        building={building}
        currentMonthPayments={currentMonthPayments}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        openIssues={openIssues}
        getApartmentName={getApartmentName}
        getTenantName={getTenantName}
        onNavigate={setPage}
        onAdd={openForm}
      /> : <CollectionPageView
        page={page}
        building={building}
        getApartmentName={getApartmentName}
        getTenantName={getTenantName}
        onDelete={handleDelete}
        onAdd={() => openForm(page)}
      />}
    </AppLayout>
    {modal && <RecordModal key={modal} page={modal} building={building} onClose={() => setModal(null)} onSubmit={handleSubmit} />}
    {notice && <div className="toast" role="status"><span aria-hidden="true">✓</span>{notice}</div>}
  </>
}