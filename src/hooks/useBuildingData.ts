import { useEffect, useState } from 'react'
import { createBuildingRecord, loadBuilding, saveBuilding } from '../api/buildingApi'
import type { BuildingData, CollectionName, CollectionPage } from '../types'
import { monthNow } from '../lib/formatters'

export function useBuildingData() {
  const [building, setBuilding] = useState<BuildingData>(loadBuilding)

  useEffect(() => saveBuilding(building), [building])

  const currentMonthPayments = building.payments.filter((payment) => payment.month === monthNow())
  const openIssues = building.issues.filter((issue) => issue.status !== 'טופלה')
  const monthlyIncome = currentMonthPayments.filter((payment) => payment.status === 'שולם').reduce((total, payment) => total + payment.amount, 0)
  const monthlyExpenses = building.expenses.filter((expense) => expense.date.slice(0, 7) === monthNow()).reduce((total, expense) => total + expense.amount, 0)

  function addRecord(page: CollectionPage, values: Record<string, string>) {
    const { collection, record } = createBuildingRecord(page, values)
    setBuilding((previous) => ({ ...previous, [collection]: [...previous[collection], record] }))
  }

  function updateRecord(page: CollectionPage, id: string, values: Record<string, string>) {
    const { collection, record } = createBuildingRecord(page, values, id)
    setBuilding((previous) => ({
      ...previous,
      [collection]: previous[collection].map((item) => item.id === id ? record : item),
    }))
  }

  function deleteRecord(collection: CollectionName, id: string) {
    setBuilding((previous) => ({ ...previous, [collection]: previous[collection].filter((record) => record.id !== id) }))
  }

  function getTenantName(id: string) {
    return building.tenants.find((tenant) => tenant.id === id)?.name || 'דייר לא ידוע'
  }

  function getApartmentName(id: string) {
    const apartment = building.apartments.find((item) => item.id === id)
    return apartment ? `דירה ${apartment.number}` : 'שטח משותף'
  }

  return { building, addRecord, updateRecord, deleteRecord, currentMonthPayments, openIssues, monthlyIncome, monthlyExpenses, getTenantName, getApartmentName }
}