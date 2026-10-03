import { useState } from 'react'
import AppLayout from './components/AppLayout'
import DialogModal from './components/DialogModal'
import ApartmentDetailsModal from './components/ApartmentDetailsModal'
import ApartmentSetupModal from './components/ApartmentSetupModal'
import BuildingSettingsModal from './components/BuildingSettingsModal'
import RecordModal from './components/RecordModal'
import OverviewPage from './pages/OverviewPage'
import CollectionPageView from './pages/CollectionPage'
import TransactionsPage from './pages/TransactionsPage'
import { useBuildingData } from './hooks/useBuildingData'
import { useNotice } from './hooks/useNotice'
import { getTenantViews, isActiveTenancy } from './lib/tenantViews'
import type { Apartment, BuildingRecord, CollectionPage, Page } from './types'

type AppDialogState =
  | { type: 'alert'; title: string; message: string }
  | { type: 'confirm'; title: string; message: string; onConfirm: () => void }

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [modal, setModal] = useState<{ page: CollectionPage; record?: BuildingRecord; initialValues?: Record<string, string> } | null>(null)
  const [viewedApartment, setViewedApartment] = useState<Apartment | null>(null)
  const [apartmentSetupOpen, setApartmentSetupOpen] = useState(false)
  const [buildingSettingsOpen, setBuildingSettingsOpen] = useState(false)
  const [quickPersonOpen, setQuickPersonOpen] = useState(false)
  const [dialog, setDialog] = useState<AppDialogState | null>(null)
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
    getPersonName,
    getApartmentName,
  } = useBuildingData()

  function openForm(target: CollectionPage) {
    if (target === 'issues' && building.apartments.length === 0) {
      setDialog({ type: 'alert', title: 'צריך להוסיף דירות', message: 'כדאי להוסיף דירות לפני דיווח על תקלה.' })
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
    if (collection === 'people' && (
      building.tenancies.some((tenancy) => tenancy.personId === id)
      || building.payments.some((payment) => payment.personId === id)
      || building.expenses.some((expense) => expense.supplierPersonId === id)
      || building.issues.some((issue) => issue.contactPersonId === id)
    )) {
      setDialog({ type: 'alert', title: 'לא ניתן למחוק איש קשר', message: 'איש הקשר משויך לרשומות. הסירו או עדכנו את הקישורים לפני המחיקה.' })
      return
    }
    setDialog({
      type: 'confirm',
      title: 'מחיקת רשומה',
      message: 'למחוק את הרשומה הזו?',
      onConfirm: () => {
        deleteRecord(collection, id)
        showNotice('הרשומה הוסרה')
      },
    })
  }

  function confirmDialog() {
    if (!dialog || dialog.type !== 'confirm') return
    dialog.onConfirm()
    setDialog(null)
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
        getPersonName={getPersonName}
        onNavigate={setPage}
        onAdd={openForm}
      /> : page === 'transactions' ? <TransactionsPage
        building={building}
        getPersonName={getPersonName}
        getApartmentName={getApartmentName}
        onAdd={openForm}
      /> : <CollectionPageView
        page={page}
        building={building}
        getApartmentName={getApartmentName}
        getPersonName={getPersonName}
        onDelete={handleDelete}
        onEdit={(record) => setModal({ page, record })}
        onViewApartment={setViewedApartment}
        onAddPayment={(apartmentId, personId) => setModal({ page: 'payments', initialValues: { apartmentId, personId } })}
        onAdd={() => openForm(page)}
        onCreateBuilding={() => setApartmentSetupOpen(true)}
      />}
    </AppLayout>
    {modal && <RecordModal key={`${modal.page}-${modal.record?.id || 'new'}`} page={modal.page} building={building} monthlyPaymentAmount={building.monthlyPaymentAmount} record={modal.record} initialValues={modal.initialValues} onCreatePerson={() => setQuickPersonOpen(true)} onClose={() => setModal(null)} onSubmit={handleSubmit} />}
    {quickPersonOpen && <RecordModal key="quick-person" page="contacts" building={building} monthlyPaymentAmount={building.monthlyPaymentAmount} onClose={() => setQuickPersonOpen(false)} onSubmit={(values) => { addRecord('contacts', values); setQuickPersonOpen(false); showNotice('איש הקשר נוסף') }} />}
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
      tenants={getTenantViews(building).filter((tenant) => tenant.apartmentId === viewedApartment.id && isActiveTenancy(tenant))}
      committeePayments={building.payments.filter((payment) => payment.apartmentId === viewedApartment.id)}
      utilities={building.utilities}
      onClose={() => setViewedApartment(null)}
      onAddUtilityPayment={(type, values) => addUtilityPayment(type, viewedApartment.id, values)}
      onUpdateUtilityPayment={(type, id, values) => updateUtilityPayment(type, id, values)}
    />}
    {dialog && <DialogModal type={dialog.type} title={dialog.title} message={dialog.message} onClose={() => setDialog(null)} onConfirm={dialog.type === 'confirm' ? confirmDialog : undefined} />}
    {notice && <div className="toast" role="status"><span aria-hidden="true">✓</span>{notice}</div>}
  </>
}