import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Card } from '../../components/ui/Card'
import { useApp } from '../../hooks/useApp'
import { getFirstName } from '../../lib/expenseBalance'
import { calculateMonthlyBalance, getMonthlyVerdict } from '../../lib/monthlyBalance'
import { getPeriodLabel } from '../../lib/periodUtils'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import { fetchMonthlyDashboardData } from '../../services/balanceService'
import { PeriodSelector } from '../FixedAndSalaries/PeriodSelector'

const now = new Date()

function SummaryCard({ label, value, accent = 'text-slate-900' }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>$ {formatAmountDisplay(value)}</p>
    </Card>
  )
}

function ExpenseBreakdownChart({ daily, fixed, cards }) {
  const total = daily + fixed + cards
  if (total <= 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Sin gastos registrados para mostrar el gráfico.
      </p>
    )
  }

  const segments = [
    { label: 'Día a día', value: daily, color: 'bg-indigo-500' },
    { label: 'Fijos', value: fixed, color: 'bg-violet-500' },
    { label: 'Tarjetas', value: cards, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map(
          (segment) =>
            segment.value > 0 && (
              <div
                key={segment.label}
                className={`${segment.color} h-full`}
                style={{ width: `${(segment.value / total) * 100}%` }}
                title={`${segment.label}: ${((segment.value / total) * 100).toFixed(0)}%`}
              />
            ),
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-sm">
            <span className={`h-3 w-3 rounded-full ${segment.color}`} />
            <span className="text-slate-600">{segment.label}</span>
            <span className="ml-auto font-medium text-slate-900">
              $ {formatAmountDisplay(segment.value)} (
              {((segment.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BalanceView() {
  const { users } = useApp()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchMonthlyDashboardData(month, year)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'No se pudo cargar el balance')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [month, year])

  const balanceResult = useMemo(() => {
    if (!data || users.length < 2) return null
    return calculateMonthlyBalance({
      users,
      splitBalance: data.splitBalance,
      dailyExpenses: data.dailyExpenses,
      fixedExpenses: data.fixedExpenses,
      installments: data.installments,
    })
  }, [data, users])

  const verdict = useMemo(() => {
    if (!balanceResult) return null
    return getMonthlyVerdict(users, balanceResult.balance)
  }, [balanceResult, users])

  if (users.length < 2) {
    return (
      <PageWrapper title="Balance mensual" description="Resumen financiero del mes.">
        <Card>
          <p className="text-sm text-slate-600">
            Configurá los dos usuarios de la pareja para ver el balance.
          </p>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Balance mensual"
      description={`Resumen de ${getPeriodLabel(month, year)}`}
    >
      <Card className="p-4">
        <PeriodSelector
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Calculando balance...</span>
        </div>
      ) : balanceResult ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Total gastado en el mes"
              value={balanceResult.totals.all}
            />
            <SummaryCard label="Gastos fijos" value={balanceResult.totals.fixed} />
            <SummaryCard label="Total tarjetas" value={balanceResult.totals.cards} />
          </div>

          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Distribución de gastos
            </h2>
            <ExpenseBreakdownChart
              daily={balanceResult.totals.daily}
              fixed={balanceResult.totals.fixed}
              cards={balanceResult.totals.cards}
            />
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <p className="font-semibold text-slate-900">{getFirstName(user.name)}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Pagó</dt>
                    <dd className="font-medium">$ {formatAmountDisplay(balanceResult.paid[user.id])}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Le correspondía</dt>
                    <dd className="font-medium">
                      $ {formatAmountDisplay(balanceResult.shouldPay[user.id])}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <dt className="text-slate-500">Balance</dt>
                    <dd
                      className={`font-semibold ${
                        (balanceResult.balance[user.id] ?? 0) >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {(balanceResult.balance[user.id] ?? 0) >= 0 ? '+' : '-'}$
                      {formatAmountDisplay(Math.abs(balanceResult.balance[user.id] ?? 0))}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>

          {verdict && (
            <Card
              className={`border-2 p-6 text-center ${
                verdict.settled
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <p
                className={`text-lg font-semibold sm:text-xl ${
                  verdict.settled ? 'text-emerald-800' : 'text-red-800'
                }`}
              >
                {verdict.message}
              </p>
              {!verdict.settled && (
                <p className="mt-3 text-3xl font-bold text-red-700 sm:text-4xl">
                  $ {formatAmountDisplay(verdict.amount)}
                </p>
              )}
            </Card>
          )}

          {!data?.splitBalance && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No hay sueldos del mes anterior cargados. Los gastos fijos se repartirán 50/50
              hasta que cargues los ingresos en Fijos y Sueldos.
            </p>
          )}
        </div>
      ) : null}
    </PageWrapper>
  )
}
