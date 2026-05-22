import {
  Car,
  Film,
  Home,
  MoreHorizontal,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react'

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Comida', icon: UtensilsCrossed },
  { id: 'transport', label: 'Transporte', icon: Car },
  { id: 'entertainment', label: 'Entretenimiento', icon: Film },
  { id: 'shopping', label: 'Compras', icon: ShoppingCart },
  { id: 'home', label: 'Hogar', icon: Home },
  { id: 'other', label: 'Otros', icon: MoreHorizontal },
]

export const CURRENCIES = [
  { code: 'ARS', symbol: '$', label: 'Peso' },
  { code: 'USD', symbol: 'US$', label: 'Dólar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
]
