import { ChevronRight } from 'lucide-react'
import { EXPENSE_CATEGORIES, CURRENCIES } from '../../lib/expenseCategories'
import { groupExpensesByDate } from '../../lib/expenseDates'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import { Card } from '../ui/Card'

function getCategoryIcon(categoryId) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === categoryId)
  return cat?.icon ?? EXPENSE_CATEGORIES.at(-1).icon
}

function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export function ExpenseList({ expenses, users, loading, onSelect }) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500">Cargando gastos...</p>
  }

  if (expenses.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm text-slate-500">Todavía no hay gastos cargados.</p>
      </Card>
    )
  }

  const usersById = Object.fromEntries(users.map((u) => [u.id, u]))
  const groups = groupExpensesByDate(expenses)

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.date}>
          <h3 className="mb-2 text-sm font-semibold capitalize text-slate-700">
            {group.label}
          </h3>
          <ul className="space-y-2">
            {group.expenses.map((expense) => {
              const Icon = getCategoryIcon(expense.category)
              const payer = usersById[expense.paid_by_user_id]
              const symbol = getCurrencySymbol(expense.currency)
              const splitCount = expense.split_for?.length ?? 0

              return (
                <li key={expense.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(expense)}
                    className="w-full text-left transition-transform active:scale-[0.99]"
                  >
                    <Card className="flex items-center gap-3 py-4 hover:border-indigo-200 hover:shadow-md">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {expense.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payer?.name?.split(' ')[0] ?? '—'} pagó
                          {splitCount === 1 && ' · personal'}
                          {splitCount > 1 && ' · dividido'}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">
                        {symbol} {formatAmountDisplay(Number(expense.amount))}
                      </p>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                    </Card>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
