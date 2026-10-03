import { useEffect, useState } from 'react'
import { createBuildingRecord, createUtilityPayment, loadBuilding, saveBuilding } from '../api/buildingApi'
import type { Apartment, BuildingData, CollectionName, CollectionPage, Person, Tenancy, UtilityKind } from '../types'
import { makeId, monthNow, today } from '../lib/formatters'

export function useBuildingData() {
  const [building, setBuilding] = useState<BuildingData>(loadBuilding)

  useEffect(() => saveBuilding(building), [building])

  const currentMonthPayments = building.payments.filter((payment) => payment.date.slice(0, 7) === monthNow())
  const openIssues = building.issues.filter((issue) => issue.status !== 'טופלה')
  const monthlyIncome = currentMonthPayments.filter((payment) => payment.status === 'שולם').reduce((total, payment) => total + payment.amount, 0)
  const monthlyExpenses = building.expenses.filter((expense) => expense.date.slice(0, 7) === monthNow()).reduce((total, expense) => total + expense.amount, 0)

  function addRecord(page: CollectionPage, values: Record<string, string>) {
    const { collection, record } = createBuildingRecord(page, values)
    setBuilding((previous) => ({ ...previous, [collection]: [...previous[collection], record] }))
  }

  function createApartmentsWithTenants(floors: number, apartmentsPerFloor: number) {
    const apartments: Apartment[] = []
    const people: Person[] = []
    const tenancies: Tenancy[] = []

    for (let floor = 1; floor <= floors; floor += 1) {
      for (let apartmentOnFloor = 0; apartmentOnFloor < apartmentsPerFloor; apartmentOnFloor += 1) {
        const number = String(apartments.length + 1)
        const id = makeId()
        const personId = makeId()
        apartments.push({ id, number, floor: String(floor), rooms: '', size: '' })
        people.push({
          id: personId,
          name: `דייר/ת דירה ${number}`,
          phone: '',
          email: '',
          roles: [],
        })
        tenancies.push({
          id: makeId(),
          personId,
          apartmentId: id,
          startDate: today(),
          endDate: '',
          isOwner: false,
        })
      }
    }

    setBuilding((previous) => ({
      ...previous,
      apartments: [...previous.apartments, ...apartments],
      people: [...previous.people, ...people],
      tenancies: [...previous.tenancies, ...tenancies],
    }))
  }

  function updateMonthlyPaymentAmount(amount: number) {
    setBuilding((previous) => ({ ...previous, monthlyPaymentAmount: amount }))
  }

  function updateRecord(page: CollectionPage, id: string, values: Record<string, string>) {
    const { collection, record } = createBuildingRecord(page, values, id)
    setBuilding((previous) => ({
      ...previous,
      [collection]: previous[collection].map((item) => item.id === id ? record : item),
    }))
  }

  function addUtilityPayment(type: UtilityKind, apartmentId: string, values: Omit<BuildingData['utilities']['water'][number], 'id' | 'apartmentId' | 'createdAt'>) {
    const { payment } = createUtilityPayment(type, apartmentId, values)
    setBuilding((previous) => ({
      ...previous,
      utilities: { ...previous.utilities, [type]: [...previous.utilities[type], payment] },
    }))
  }

  function updateUtilityPayment(type: UtilityKind, id: string, values: Omit<BuildingData['utilities']['water'][number], 'id' | 'apartmentId' | 'createdAt'>) {
    setBuilding((previous) => ({
      ...previous,
      utilities: {
        ...previous.utilities,
        [type]: previous.utilities[type].map((payment) => payment.id === id ? { ...payment, ...values } : payment),
      },
    }))
  }

  function deleteRecord(collection: CollectionName, id: string) {
    setBuilding((previous) => ({ ...previous, [collection]: previous[collection].filter((record) => record.id !== id) }))
  }

  function getPersonName(id: string) {
    return building.people.find((person) => person.id === id)?.name || 'איש קשר לא ידוע'
  }

  function getApartmentName(id: string) {
    const apartment = building.apartments.find((item) => item.id === id)
    return apartment ? `דירה ${apartment.number}` : 'שטח משותף'
  }

  return { building, addRecord, createApartmentsWithTenants, updateRecord, updateMonthlyPaymentAmount, addUtilityPayment, updateUtilityPayment, deleteRecord, currentMonthPayments, openIssues, monthlyIncome, monthlyExpenses, getPersonName, getApartmentName }
}