import { getFirstName } from '../../lib/expenseBalance'
import { formatAmountDisplay } from '../../lib/safeMathEval'

function Cell({ children, className = '', muted = false, bold = false }) {
  return (
    <td
      className={`whitespace-nowrap px-3 py-2 text-sm ${
        muted ? 'text-slate-500' : 'text-slate-900'
      } ${bold ? 'font-semibold' : ''} ${className}`}
    >
      {children}
    </td>
  )
}

function HeaderCell({ children, align = 'left' }) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function formatPercent(value) {
  if (value == null) return '—'
  return `${value.toFixed(2).replace('.', ',')}%`
}

export function FixedExpenseSettlementTable({ users, report }) {
  const { categories, montos, total, paidByCategory, userRows } = report

  const activeCategories = categories.filter((cat) => (montos[cat.id] ?? 0) > 0)
  const displayCategories = activeCategories.length > 0 ? activeCategories : categories

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <HeaderCell />
            {displayCategories.map((cat) => (
              <HeaderCell key={cat.id} align="right">
                {cat.label}
              </HeaderCell>
            ))}
            <HeaderCell align="right">Total</HeaderCell>
            <HeaderCell align="right">% ingreso</HeaderCell>
            <HeaderCell align="right">Excedente</HeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          <tr className="bg-slate-50/80">
            <Cell muted bold>
              Monto
            </Cell>
            {displayCategories.map((cat) => (
              <Cell key={cat.id} bold>
                <span className="block text-right">
                  $ {formatAmountDisplay(montos[cat.id] ?? 0)}
                </span>
              </Cell>
            ))}
            <Cell bold>
              <span className="block text-right font-semibold">
                $ {formatAmountDisplay(total)}
              </span>
            </Cell>
            <Cell muted>—</Cell>
            <Cell muted>—</Cell>
          </tr>

          {userRows.map((row) => {
            const user = users.find((u) => u.id === row.userId)
            if (!user) return null

            return (
              <tr key={row.userId}>
                <Cell bold>{getFirstName(user.name)}</Cell>
                {displayCategories.map((cat) => (
                  <Cell key={cat.id}>
                    <span className="block text-right">
                      $ {formatAmountDisplay(row.shares[cat.id] ?? 0)}
                    </span>
                  </Cell>
                ))}
                <Cell bold>
                  <span className="block text-right">
                    $ {formatAmountDisplay(row.totalShare)}
                  </span>
                </Cell>
                <Cell>
                  <span className="block text-right text-slate-600">
                    {formatPercent(row.expensePercentOfIncome)}
                  </span>
                </Cell>
                <Cell>
                  <span
                    className={`block text-right font-medium ${
                      (row.excedente ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {row.excedente != null
                      ? `$ ${formatAmountDisplay(row.excedente)}`
                      : '—'}
                  </span>
                </Cell>
              </tr>
            )
          })}
        </tbody>
      </table>

      {userRows.some((row) =>
        displayCategories.some((cat) => {
          const paid = report.paidByCategory[cat.id]?.[row.userId] ?? 0
          return paid > 0
        }),
      ) && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-2">
          <p className="text-xs font-medium text-slate-500">Pagado por categoría</p>
          <div className="mt-2 space-y-1">
            {displayCategories.map((cat) => {
              const paidMap = paidByCategory[cat.id] ?? {}
              const entries = users
                .map((u) => ({ user: u, amount: paidMap[u.id] ?? 0 }))
                .filter((e) => e.amount > 0)
              if (entries.length === 0) return null

              return (
                <p key={cat.id} className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">{cat.label}:</span>{' '}
                  {entries
                    .map(
                      (e) =>
                        `${getFirstName(e.user.name)} ($ ${formatAmountDisplay(e.amount)})`,
                    )
                    .join(' · ')}
                </p>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
