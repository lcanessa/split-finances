import { CreditCard, LayoutDashboard, Receipt, Home } from 'lucide-react'

export const MAIN_NAV_ITEMS = [
  {
    to: '/balance',
    label: 'Balance',
    shortLabel: 'Balance',
    icon: LayoutDashboard,
  },
  {
    to: '/dia-a-dia',
    label: 'Día a Día',
    shortLabel: 'Día a Día',
    icon: Receipt,
  },
  {
    to: '/fijos-sueldos',
    label: 'Fijos y Sueldos',
    shortLabel: 'Fijos',
    icon: Home,
  },
  {
    to: '/tarjetas',
    label: 'Tarjetas',
    shortLabel: 'Tarjetas',
    icon: CreditCard,
  },
]

export function isMainNavActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}
