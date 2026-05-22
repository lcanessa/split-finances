import { ArrowRight, Scale } from 'lucide-react'
import { calculateBalances, getFirstName, getSettlement } from '../../lib/expenseBalance'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import { getInitials } from '../../lib/utils'
import { Card } from '../ui/Card'

export function ExpenseBalance({ expenses, users, loading }) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500">Calculando...</p>
  }

  if (expenses.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm text-slate-500">Sin gastos no hay balance que mostrar.</p>
      </Card>
    )
  }

  const { balance, paidTotal, shareTotal, totalAll } = calculateBalances(expenses, users)
  const settlement = getSettlement(users, balance)

  return (
    <div className="space-y-4">
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex items-center gap-2 text-indigo-700">
          <Scale className="h-5 w-5" />
          <p className="text-sm font-semibold">Balance entre ustedes</p>
        </div>
        {settlement.settled ? (
          <p className="mt-3 text-lg font-medium text-slate-800">{settlement.message}</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-red-600">
                  -{formatAmountDisplay(settlement.amount)}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {getFirstName(settlement.debtor.name)}
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-indigo-500" />
              <div>
                <p className="text-lg font-bold text-emerald-600">
                  +{formatAmountDisplay(settlement.amount)}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {getFirstName(settlement.creditor.name)}
                </p>
              </div>
            </div>
            <p className="rounded-xl bg-white/80 px-4 py-3 text-center text-sm font-medium text-slate-800">
              {settlement.message}
            </p>
          </div>
        )}
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Total gastado (entre los dos)
        </p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          $ {formatAmountDisplay(totalAll)}
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {users.map((user) => {
          const bal = balance[user.id] ?? 0
          const paid = paidTotal[user.id] ?? 0
          const share = shareTotal[user.id] ?? 0
          const isPositive = bal > 0.01
          const isNegative = bal < -0.01

          return (
            <Card key={user.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {getInitials(user.name)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{getFirstName(user.name)}</p>
                  <p
                    className={`text-sm font-medium ${
                      isPositive
                        ? 'text-emerald-600'
                        : isNegative
                          ? 'text-red-600'
                          : 'text-slate-500'
                    }`}
                  >
                    {isPositive && `+${formatAmountDisplay(bal)}`}
                    {isNegative && `-${formatAmountDisplay(Math.abs(bal))}`}
                    {!isPositive && !isNegative && 'A mano'}
                  </p>
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Pagó</dt>
                  <dd className="font-medium text-slate-800">
                    $ {formatAmountDisplay(paid)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Su parte</dt>
                  <dd className="font-medium text-slate-800">
                    $ {formatAmountDisplay(share)}
                  </dd>
                </div>
              </dl>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
