export const FIXED_EXPENSE_CATEGORIES = [
  { id: 'alquiler', label: 'Alquiler' },
  { id: 'expensas', label: 'Expensas' },
  { id: 'agua', label: 'Agua' },
  { id: 'tgi', label: 'TGI' },
  { id: 'epe', label: 'EPE' },
  { id: 'internet', label: 'Internet' },
  { id: 'otros', label: 'Otros' },
]

export function getFixedCategoryLabel(id) {
  return FIXED_EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id
}
