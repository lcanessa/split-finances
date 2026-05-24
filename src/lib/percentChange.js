/** Variación porcentual mes a mes: (actual - anterior) / anterior × 100 */
export function calcPercentChange(current, previous) {
  const cur = Number(current) || 0
  const prev = Number(previous) || 0
  if (prev === 0) {
    if (cur === 0) return 0
    return null
  }
  return Math.round(((cur - prev) / prev) * 10000) / 100
}

export function formatPercentChange(value, { decimals = 1 } = {}) {
  if (value == null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals).replace('.', ',')}%`
}

export function sumExpensesByCategory(expenses) {
  const map = {}
  for (const expense of expenses) {
    const cat = expense.category ?? 'otros'
    map[cat] = (map[cat] ?? 0) + Number(expense.amount)
  }
  return map
}

export function sumExpensesTotal(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0)
}
