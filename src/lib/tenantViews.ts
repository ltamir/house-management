import type { BuildingData, Tenant } from '../types'
import { today } from './formatters'

export function getTenantViews(building: Pick<BuildingData, 'people' | 'tenancies'>): Tenant[] {
  const peopleById = new Map(building.people.map((person) => [person.id, person]))
  return building.tenancies.flatMap((tenancy) => {
    const person = peopleById.get(tenancy.personId)
    return person ? [{ ...person, ...tenancy }] : []
  })
}

export function isActiveTenancy(tenancy: Pick<Tenant, 'startDate' | 'endDate'>, date = today()) {
  return (!tenancy.startDate || tenancy.startDate <= date) && (!tenancy.endDate || tenancy.endDate >= date)
}