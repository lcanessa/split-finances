const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function getPeriodLabel(month, year) {
  return `${MONTHS[month - 1] ?? ''} ${year}`
}

export function getPreviousPeriod(month, year) {
  if (month === 1) return { month: 12, year: year - 1 }
  return { month: month - 1, year }
}

export function getNextPeriod(month, year) {
  if (month === 12) return { month: 1, year: year + 1 }
  return { month: month + 1, year }
}

export function periodKey(month, year) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function comparePeriods(aMonth, aYear, bMonth, bYear) {
  if (aYear !== bYear) return aYear - bYear
  return aMonth - bMonth
}

export function sortPeriodsDesc(periods) {
  return [...periods].sort((a, b) => comparePeriods(b.month, b.year, a.month, a.year))
}
