import {
  DoorOpen,
  ArrowLeftRight,
  Contact,
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
  defaultEmpty?: boolean
  options?: { value: string; label: string }[]
}

export const navigationItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'סקירה כללית', icon: LayoutDashboard },
  { id: 'transactions', label: 'תנועות', icon: ArrowLeftRight },
  { id: 'contacts', label: 'אנשי קשר', icon: Contact },
  { id: 'tenants', label: 'דיירים', icon: Users },
  { id: 'apartments', label: 'דירות', icon: DoorOpen },
  { id: 'payments', label: 'תשלומים', icon: Wallet },
  { id: 'expenses', label: 'הוצאות', icon: FileText },
  { id: 'issues', label: 'תקלות', icon: Wrench },
]

export const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  overview: { title: 'סקירה כללית', subtitle: 'הבית מתנהל טוב יותר כשכולם מעודכנים.' },
  transactions: { title: 'תנועות', subtitle: 'כל התקבולים וההוצאות, עם יתרה מצטברת.' },
  contacts: { title: 'אנשי קשר', subtitle: 'אנשים וספקים שעובדים עם הבניין.' },
  tenants: { title: 'הדיירים שלנו', subtitle: 'אנשי הקשר והדיירים בבניין.' },
  apartments: { title: 'הדירות בבניין', subtitle: 'תפוסה, דיירים ופרטי הדירות.' },
  payments: { title: 'תשלומים', subtitle: 'מעקב אחר תשלומי ועד הבית.' },
  expenses: { title: 'הוצאות', subtitle: 'כל הוצאות הבניין, במקום אחד.' },
  issues: { title: 'תקלות ותחזוקה', subtitle: 'מעקב אחר מה שדורש טיפול בבניין.' },
}

export const singularLabels: Record<CollectionPage, string> = {
  contacts: 'איש קשר', tenants: 'דייר/ת', apartments: 'דירה', payments: 'תשלום', expenses: 'הוצאה', issues: 'תקלה',
}

export const collectionNames: Record<CollectionPage, CollectionName> = {
  contacts: 'people', tenants: 'tenancies', apartments: 'apartments', payments: 'payments', expenses: 'expenses', issues: 'issues',
}

export const recordForms: Record<CollectionPage, { collection: CollectionName; fields: FieldDefinition[] }> = {
  contacts: { collection: 'people', fields: [
    { name: 'name', label: 'שם מלא', required: true }, { name: 'phone', label: 'טלפון', type: 'tel' },
    { name: 'email', label: 'דוא״ל', type: 'email' },
    { name: 'roles', label: 'תפקידים וקשרים', type: 'checkbox-group', options: [
      { value: 'externalTenant', label: 'דייר/ת בבניין אחר' }, { value: 'neighbor', label: 'שכן/ה' },
      { value: 'cityEmployee', label: 'עובד/ת עירייה' }, { value: 'supplier', label: 'ספק/ית' }, { value: 'other', label: 'אחר' },
    ] },
  ] },
  tenants: { collection: 'tenancies', fields: [
    { name: 'personId', label: 'איש/אשת קשר', options: [], required: true },
    { name: 'apartmentId', label: 'דירה', options: [], required: true },
    { name: 'startDate', label: 'תאריך כניסה', type: 'date', required: true },
    { name: 'endDate', label: 'תאריך יציאה', type: 'date', defaultEmpty: true },
    { name: 'isOwner', label: 'בעל/ת הדירה', type: 'checkbox' },
  ] },
  apartments: { collection: 'apartments', fields: [
    { name: 'number', label: 'מספר דירה', required: true }, { name: 'floor', label: 'קומה', type: 'number', required: true },
    { name: 'rooms', label: 'מספר חדרים', type: 'number' }, { name: 'size', label: 'גודל (מ״ר)', type: 'number' },
  ] },
  payments: { collection: 'payments', fields: [
    { name: 'personId', label: 'דייר/ת', options: [] },
    { name: 'apartmentId', label: 'דירה / מיקום', options: [], required: true },
    { name: 'fromMonth', label: 'מתחילת חודש', type: 'month', required: true }, { name: 'toMonth', label: 'עד סוף חודש', type: 'month', required: true },
    { name: 'amount', label: 'סכום לתשלום (₪)', type: 'number', required: true }, { name: 'date', label: 'תאריך תשלום', type: 'date' },
    { name: 'status', label: 'סטטוס', options: [{ value: 'שולם', label: 'שולם' }, { value: 'ממתין', label: 'ממתין' }] },
  ] },
  expenses: { collection: 'expenses', fields: [
    { name: 'title', label: 'תיאור ההוצאה', required: true },
    { name: 'category', label: 'קטגוריה', options: ['ניקיון', 'תחזוקה', 'גינון', 'ביטוח', 'חשמל', 'אחר'].map((value) => ({ value, label: value })) },
    { name: 'amount', label: 'סכום (₪)', type: 'number', required: true }, { name: 'date', label: 'תאריך', type: 'date', required: true },
    { name: 'supplierPersonId', label: 'ספק/ית', options: [] }, { name: 'vendor', label: 'פרטי ספק / הערה' },
  ] },
  issues: { collection: 'issues', fields: [
    { name: 'title', label: 'תיאור התקלה', required: true }, { name: 'apartmentId', label: 'מיקום / דירה', options: [], required: true },
    { name: 'contactPersonId', label: 'איש/אשת קשר', options: [] },
    { name: 'date', label: 'תאריך דיווח', type: 'date', required: true },
    { name: 'priority', label: 'דחיפות', options: [{ value: 'רגילה', label: 'רגילה' }, { value: 'דחופה', label: 'דחופה' }] },
    { name: 'status', label: 'סטטוס טיפול', options: [{ value: 'פתוחה', label: 'פתוחה' }, { value: 'בטיפול', label: 'בטיפול' }, { value: 'טופלה', label: 'טופלה' }] },
  ] },
}

export function isCollectionPage(page: Page): page is CollectionPage {
  return page !== 'overview' && page !== 'transactions'
}