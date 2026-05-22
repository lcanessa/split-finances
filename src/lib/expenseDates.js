function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function shiftDate(isoDate, days) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getDateGroupLabel(dateStr) {
  const today = todayISO()
  const yesterday = shiftDate(today, -1)
  const dayBefore = shiftDate(today, -2)

  if (dateStr === today) return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  if (dateStr === dayBefore) return 'Anteayer'

  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function groupExpensesByDate(expenses) {
  const byDate = new Map()

  for (const expense of expenses) {
    const key = expense.date
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key).push(expense)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: getDateGroupLabel(date),
      expenses: items,
    }))
}
