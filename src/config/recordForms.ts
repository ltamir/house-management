import {
  DoorOpen,
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { CollectionName, CollectionPage, Page } from '../types'

export type FieldDefinition = {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

export const navigationItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'סקירה כללית', icon: LayoutDashboard },
  { id: 'transactions', label: 'תנועות', icon: ArrowLeftRight },
  { id: 'tenants', label: 'דיירים', icon: Users },
  { id: 'apartments', label: 'דירות', icon: DoorOpen },
  { id: 'payments', label: 'תשלומים', icon: Wallet },
  { id: 'expenses', label: 'הוצאות', icon: FileText },
  { id: 'issues', label: 'תקלות', icon: Wrench },
]

export const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  overview: { title: 'סקירה כללית', subtitle: 'הבית מתנהל טוב יותר כשכולם מעודכנים.' },
  transactions: { title: 'תנועות', subtitle: 'כל התקבולים וההוצאות, עם יתרה מצטברת.' },
  tenants: { title: 'הדיירים שלנו', subtitle: 'אנשי הקשר והדיירים בבניין.' },
  apartments: { title: 'הדירות בבניין', subtitle: 'תפוסה, דיירים ופרטי הדירות.' },
  payments: { title: 'תשלומים', subtitle: 'מעקב אחר תשלומי ועד הבית.' },
  expenses: { title: 'הוצאות', subtitle: 'כל הוצאות הבניין, במקום אחד.' },
  issues: { title: 'תקלות ותחזוקה', subtitle: 'מעקב אחר מה שדורש טיפול בבניין.' },
}

export const singularLabels: Record<CollectionPage, string> = {
  tenants: 'דייר', apartments: 'דירה', payments: 'תשלום', expenses: 'הוצאה', issues: 'תקלה',
}

export const collectionNames: Record<CollectionPage, CollectionName> = {
  tenants: 'tenants', apartments: 'apartments', payments: 'payments', expenses: 'expenses', issues: 'issues',
}

export const recordForms: Record<CollectionPage, { collection: CollectionName; fields: FieldDefinition[] }> = {
  tenants: { collection: 'tenants', fields: [
    { name: 'name', label: 'שם מלא', required: true }, { name: 'phone', label: 'טלפון', type: 'tel', required: true },
    { name: 'email', label: 'דוא״ל', type: 'email' }, { name: 'apartmentId', label: 'דירה', options: [] },
    { name: 'isOwner', label: 'בעל/ת הדירה', type: 'checkbox' },
  ] },
  apartments: { collection: 'apartments', fields: [
    { name: 'number', label: 'מספר דירה', required: true }, { name: 'floor', label: 'קומה', type: 'number', required: true },
    { name: 'rooms', label: 'מספר חדרים', type: 'number', required: true },
  ] },
  payments: { collection: 'payments', fields: [
    { name: 'tenantId', label: 'דייר', options: [], required: true },
    { name: 'fromMonth', label: 'מתחילת חודש', type: 'month', required: true }, { name: 'toMonth', label: 'עד סוף חודש', type: 'month', required: true },
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

export function isCollectionPage(page: Page): page is CollectionPage {
  return page !== 'overview' && page !== 'transactions'
}