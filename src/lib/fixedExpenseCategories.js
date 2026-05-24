export const FIXED_EXPENSE_CATEGORIES = [
  { id: 'alquiler', label: 'Alquiler', split: 'salary' },
  { id: 'expensas', label: 'Expensas', split: 'salary' },
  { id: 'agua', label: 'Agua', split: 'salary' },
  { id: 'tgi', label: 'TGI', split: 'salary' },
  { id: 'epe', label: 'EPE', split: 'salary' },
  { id: 'internet', label: 'Internet', split: 'salary' },
  { id: 'otros', label: 'Otros', split: 'equal' },
]

export function getFixedCategoryLabel(id) {
  return FIXED_EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id
}
