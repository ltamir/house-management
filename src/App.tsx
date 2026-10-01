import { useState } from 'react'
import AppLayout from './components/AppLayout'
import ApartmentDetailsModal from './components/ApartmentDetailsModal'
import ApartmentSetupModal from './components/ApartmentSetupModal'
import BuildingSettingsModal from './components/BuildingSettingsModal'
import RecordModal from './components/RecordModal'
import OverviewPage from './pages/OverviewPage'
import CollectionPageView from './pages/CollectionPage'
import TransactionsPage from './pages/TransactionsPage'
import { useBuildingData } from './hooks/useBuildingData'
import { useNotice } from './hooks/useNotice'
import type { Apartment, BuildingRecord, CollectionPage, Page } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [modal, setModal] = useState<{ page: CollectionPage; record?: BuildingRecord } | null>(null)
  const [viewedApartment, setViewedApartment] = useState<Apartment | null>(null)
  const [apartmentSetupOpen, setApartmentSetupOpen] = useState(false)
  const [buildingSettingsOpen, setBuildingSettingsOpen] = useState(false)
  const { notice, showNotice } = useNotice()
  const {
    building,
    addRecord,
    createApartmentsWithTenants,
    updateRecord,
    addUtilityPayment,
    updateUtilityPayment,
    updateMonthlyPaymentAmount,
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
    setModal({ page: target })
  }

  function handleSubmit(values: Record<string, string>) {
    if (!modal) return
    if (modal.record) updateRecord(modal.page, modal.record.id, values)
    else addRecord(modal.page, values)
    setModal(null)
    showNotice(modal.record ? 'השינויים נשמרו' : 'נוסף בהצלחה ונשמר במכשיר')
  }

  function handleDelete(collection: Parameters<typeof deleteRecord>[0], id: string) {
    if (!window.confirm('למחוק את הרשומה הזו?')) return
    deleteRecord(collection, id)
    showNotice('הרשומה הוסרה')
  }

  return <>
    <AppLayout page={page} openIssuesCount={openIssues.length} apartmentCount={building.apartments.length} monthlyPaymentAmount={building.monthlyPaymentAmount} onNavigate={setPage} onAdd={openForm} onEditBuilding={() => setBuildingSettingsOpen(true)}>
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
      /> : page === 'transactions' ? <TransactionsPage
        building={building}
        getTenantName={getTenantName}
        onAdd={openForm}
      /> : <CollectionPageView
        page={page}
        building={building}
        getApartmentName={getApartmentName}
        getTenantName={getTenantName}
        onDelete={handleDelete}
        onEdit={(record) => setModal({ page, record })}
        onViewApartment={setViewedApartment}
        onAdd={() => openForm(page)}
        onCreateBuilding={() => setApartmentSetupOpen(true)}
      />}
    </AppLayout>
    {modal && <RecordModal key={`${modal.page}-${modal.record?.id || 'new'}`} page={modal.page} building={building} monthlyPaymentAmount={building.monthlyPaymentAmount} record={modal.record} onClose={() => setModal(null)} onSubmit={handleSubmit} />}
    {apartmentSetupOpen && <ApartmentSetupModal
      onClose={() => setApartmentSetupOpen(false)}
      onSubmit={(floors, apartmentsPerFloor) => {
        createApartmentsWithTenants(floors, apartmentsPerFloor)
        setApartmentSetupOpen(false)
        showNotice(`נוצרו ${floors * apartmentsPerFloor} דירות ודיירים לדוגמה`)
      }}
    />}
    {buildingSettingsOpen && <BuildingSettingsModal
      monthlyPaymentAmount={building.monthlyPaymentAmount}
      onClose={() => setBuildingSettingsOpen(false)}
      onSave={(amount) => { updateMonthlyPaymentAmount(amount); setBuildingSettingsOpen(false); showNotice('התשלום החודשי עודכן') }}
    />}
    {viewedApartment && <ApartmentDetailsModal
      key={viewedApartment.id}
      apartment={viewedApartment}
      tenants={building.tenants.filter((tenant) => tenant.apartmentId === viewedApartment.id)}
      committeePayments={building.payments.filter((payment) => building.tenants.some((tenant) => tenant.id === payment.tenantId && tenant.apartmentId === viewedApartment.id))}
      utilities={building.utilities}
      onClose={() => setViewedApartment(null)}
      onAddUtilityPayment={(type, values) => addUtilityPayment(type, viewedApartment.id, values)}
      onUpdateUtilityPayment={(type, id, values) => updateUtilityPayment(type, id, values)}
    />}
    {notice && <div className="toast" role="status"><span aria-hidden="true">✓</span>{notice}</div>}
  </>
}