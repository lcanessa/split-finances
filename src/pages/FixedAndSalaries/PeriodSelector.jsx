const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

function buildYearOptions() {
  const current = new Date().getFullYear()
  return Array.from({ length: current - 2019 + 2 }, (_, i) => 2020 + i)
}

export function PeriodSelector({ month, year, onMonthChange, onYearChange }) {
  const years = buildYearOptions()

  return (
    <div className="flex flex-wrap gap-3">
      <div className="min-w-[140px] flex-1">
        <label htmlFor="period-month" className="mb-1 block text-xs font-medium text-slate-500">
          Mes
        </label>
        <select
          id="period-month"
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="sheet-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:text-sm"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[100px] flex-1">
        <label htmlFor="period-year" className="mb-1 block text-xs font-medium text-slate-500">
          Año
        </label>
        <select
          id="period-year"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="sheet-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
