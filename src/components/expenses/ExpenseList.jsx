import { Pencil, Trash2 } from 'lucide-react'
import { EXPENSE_CATEGORIES, CURRENCIES } from '../../lib/expenseCategories'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

function getCategoryIcon(categoryId) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === categoryId)
  return cat?.icon ?? EXPENSE_CATEGORIES.at(-1).icon
}

function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export function ExpenseList({
  expenses,
  users,
  loading,
  editingId,
  deletingId,
  onEdit,
  onDelete,
}) {
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

  return (
    <ul className="space-y-2">
      {expenses.map((expense) => {
        const Icon = getCategoryIcon(expense.category)
        const payer = usersById[expense.paid_by_user_id]
        const symbol = getCurrencySymbol(expense.currency)
        const splitCount = expense.split_for?.length ?? 0
        const isEditing = editingId === expense.id
        const isDeleting = deletingId === expense.id

        return (
          <li key={expense.id}>
            <Card
              className={`flex items-center gap-3 py-4 transition-colors ${
                isEditing ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
              }`}
            >
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
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  disabled={isDeleting}
                  aria-label="Editar gasto"
                  className="px-2"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(expense)}
                  disabled={isDeleting}
                  aria-label="Eliminar gasto"
                  className="px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
