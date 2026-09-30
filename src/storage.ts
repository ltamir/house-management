import type { BuildingData } from './types'

const STORAGE_KEY = 'beitenu-building-data-v1'

const emptyBuilding: BuildingData = {
  tenants: [],
  apartments: [],
  payments: [],
  expenses: [],
  issues: [],
}

export function loadBuilding(): BuildingData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyBuilding
    const parsed = JSON.parse(saved) as Partial<BuildingData>
    return {
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      apartments: Array.isArray(parsed.apartments) ? parsed.apartments : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    }
  } catch {
    return emptyBuilding
  }
}

export function saveBuilding(building: BuildingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(building))
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
}