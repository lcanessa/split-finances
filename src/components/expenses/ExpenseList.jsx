import { EXPENSE_CATEGORIES, CURRENCIES } from '../../lib/expenseCategories'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import { Card } from '../ui/Card'

function getCategoryIcon(categoryId) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === categoryId)
  return cat?.icon ?? EXPENSE_CATEGORIES.at(-1).icon
}

function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export function ExpenseList({ expenses, users, loading }) {
  if (loading) {
    return <p className="text-center text-sm text-slate-500 py-8">Cargando gastos...</p>
  }

  if (expenses.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm text-slate-500">Todavía no hay gastos cargados.</p>
      </Card>
    )
  }

  const usersById = Object.fromEntries(users.map((u) => [u.id, u]))

  return (
    <ul className="space-y-2">
      {expenses.map((expense) => {
        const Icon = getCategoryIcon(expense.category)
        const payer = usersById[expense.paid_by_user_id]
        const symbol = getCurrencySymbol(expense.currency)
        const splitCount = expense.split_for?.length ?? 0

        return (
          <li key={expense.id}>
            <Card className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{expense.description}</p>
                <p className="text-xs text-slate-500">
                  {payer?.name?.split(' ')[0] ?? '—'} pagó ·{' '}
                  {new Date(expense.date + 'T12:00:00').toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {splitCount === 1 && ' · 100% personal'}
                  {splitCount > 1 && ' · dividido'}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-slate-900">
                {symbol} {formatAmountDisplay(Number(expense.amount))}
              </p>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
