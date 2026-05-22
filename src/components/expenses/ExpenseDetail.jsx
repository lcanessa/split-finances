import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { EXPENSE_CATEGORIES, CURRENCIES } from '../../lib/expenseCategories'
import { getDateGroupLabel } from '../../lib/expenseDates'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import { getInitials } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

function getCategory(categoryId) {
  return EXPENSE_CATEGORIES.find((c) => c.id === categoryId) ?? EXPENSE_CATEGORIES.at(-1)
}

function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export function ExpenseDetail({
  expense,
  users,
  onBack,
  onEdit,
  onDelete,
  deleting,
}) {
  const category = getCategory(expense.category)
  const Icon = category.icon
  const symbol = getCurrencySymbol(expense.currency)
  const usersById = Object.fromEntries(users.map((u) => [u.id, u]))
  const payer = usersById[expense.paid_by_user_id]
  const participants = (expense.split_for ?? []).map((id) => usersById[id]).filter(Boolean)
  const amount = Number(expense.amount)
  const share =
    participants.length > 0 ? amount / participants.length : amount

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a gastos
      </button>

      <Card className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{expense.description}</h2>
            <p className="text-sm text-slate-500">{category.label}</p>
          </div>
        </div>

        <p className="text-4xl font-bold tracking-tight text-slate-900">
          {symbol} {formatAmountDisplay(amount)}
        </p>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Fecha</dt>
            <dd className="font-medium capitalize text-slate-900">
              {getDateGroupLabel(expense.date)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <dt className="text-slate-500">Pagado por</dt>
            <dd className="font-medium text-slate-900">{payer?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <dt className="text-slate-500">División</dt>
            <dd className="text-right font-medium text-slate-900">
              {participants.length > 1
                ? `Dividido (${formatAmountDisplay(share)} c/u)`
                : '100% personal'}
            </dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Para quién
          </p>
          <div className="flex flex-wrap gap-2">
            {participants.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold">
                  {getInitials(user.name)}
                </span>
                {user.name}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="secondary"
          className="flex-1 text-red-600 hover:bg-red-50"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>
    </div>
  )
}
