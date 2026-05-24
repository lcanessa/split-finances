import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { PaidByToggle } from '../../components/shared/PaidByToggle'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../hooks/useApp'
import { getFirstName } from '../../lib/expenseBalance'
import { FIXED_EXPENSE_CATEGORIES, getFixedCategoryLabel } from '../../lib/fixedExpenseCategories'
import {
  calculateFixedSettlement,
  calculateSalaryPercentages,
  getFixedSettlementMessage,
} from '../../lib/fixedExpenseSettlement'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import {
  createFixedExpense,
  deleteFixedExpense,
  fetchFixedExpenses,
  fetchMonthlyBalance,
  upsertMonthlyBalance,
} from '../../services/fixedExpensesService'
import { getPeriodLabel } from '../../lib/periodUtils'
import { PeriodSelector } from './PeriodSelector'

const now = new Date()

export function FixedExpensesView() {
  const { users, activeUser } = useApp()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [salaryA, setSalaryA] = useState('')
  const [salaryB, setSalaryB] = useState('')
  const [fixedExpenses, setFixedExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingSalaries, setSavingSalaries] = useState(false)
  const [error, setError] = useState(null)

  const [formCategory, setFormCategory] = useState('alquiler')
  const [formAmount, setFormAmount] = useState('')
  const [formPaidBy, setFormPaidBy] = useState('')
  const [submittingExpense, setSubmittingExpense] = useState(false)

  const userA = users[0]
  const userB = users[1]

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError(null)
      try {
        const [balance, expenses] = await Promise.all([
          fetchMonthlyBalance(month, year),
          fetchFixedExpenses(month, year),
        ])
        if (cancelled) return
        setSalaryA(balance ? String(balance.salary_user_a) : '')
        setSalaryB(balance ? String(balance.salary_user_b) : '')
        setFixedExpenses(expenses)
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'No se pudieron cargar los datos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [month, year])

  const effectivePaidBy = formPaidBy || activeUser?.id || userA?.id || ''

  const percentages = useMemo(
    () => calculateSalaryPercentages(salaryA, salaryB),
    [salaryA, salaryB],
  )

  const percentByUserId = useMemo(() => {
    if (!userA || !userB) return {}
    return {
      [userA.id]: percentages.percentA,
      [userB.id]: percentages.percentB,
    }
  }, [userA, userB, percentages])

  const settlement = useMemo(
    () => calculateFixedSettlement(fixedExpenses, users, percentByUserId),
    [fixedExpenses, users, percentByUserId],
  )

  const settlementMessage = useMemo(
    () => getFixedSettlementMessage(users, settlement.balance),
    [users, settlement.balance],
  )

  async function saveSalaries(valuesA, valuesB) {
    setSavingSalaries(true)
    try {
      await upsertMonthlyBalance({
        month,
        year,
        salary_user_a: Number(valuesA) || 0,
        salary_user_b: Number(valuesB) || 0,
      })
    } catch (err) {
      setError(err.message ?? 'No se pudieron guardar los sueldos')
    } finally {
      setSavingSalaries(false)
    }
  }

  function handleSalaryBlur() {
    saveSalaries(salaryA, salaryB)
  }

  async function handleAddExpense(event) {
    event.preventDefault()
    const amount = Number(formAmount)
    if (!amount || amount <= 0) return

    setSubmittingExpense(true)
    setError(null)
    try {
      await createFixedExpense({
        month,
        year,
        category: formCategory,
        amount,
        paid_by_user_id: effectivePaidBy,
      })
      setFormAmount('')
      const expenses = await fetchFixedExpenses(month, year)
      setFixedExpenses(expenses)
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar el gasto')
    } finally {
      setSubmittingExpense(false)
    }
  }

  async function handleDeleteExpense(id) {
    if (!window.confirm('¿Eliminar este gasto fijo?')) return
    try {
      await deleteFixedExpense(id)
      const expenses = await fetchFixedExpenses(month, year)
      setFixedExpenses(expenses)
    } catch (err) {
      setError(err.message ?? 'No se pudo eliminar')
    }
  }

  if (users.length < 2) {
    return (
      <PageWrapper title="Fijos y Sueldos" description="Requiere dos perfiles configurados.">
        <Card>
          <p className="text-sm text-slate-600">
            Configurá los dos usuarios de la pareja para usar esta sección.
          </p>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Fijos y Sueldos"
      description={`Liquidación de ${getPeriodLabel(month, year)}`}
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
        <p className="py-8 text-center text-sm text-slate-500">Cargando...</p>
      ) : (
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Ingresos del mes</h2>
              {savingSalaries && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Guardando...
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="salary-a"
                type="number"
                min="0"
                step="0.01"
                label={`Sueldo ${getFirstName(userA.name)}`}
                placeholder="0"
                value={salaryA}
                onChange={(e) => setSalaryA(e.target.value)}
                onBlur={handleSalaryBlur}
              />
              <Input
                id="salary-b"
                type="number"
                min="0"
                step="0.01"
                label={`Sueldo ${getFirstName(userB.name)}`}
                placeholder="0"
                value={salaryB}
                onChange={(e) => setSalaryB(e.target.value)}
                onBlur={handleSalaryBlur}
              />
            </div>
            {percentages.total > 0 && (
              <div className="grid gap-2 rounded-xl bg-indigo-50 p-4 sm:grid-cols-2">
                <p className="text-sm text-indigo-900">
                  <span className="font-semibold">{getFirstName(userA.name)}:</span>{' '}
                  {percentages.percentA.toFixed(1)}%
                </p>
                <p className="text-sm text-indigo-900">
                  <span className="font-semibold">{getFirstName(userB.name)}:</span>{' '}
                  {percentages.percentB.toFixed(1)}%
                </p>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Gastos fijos</h2>
            <form onSubmit={handleAddExpense} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="fixed-category" className="block text-sm font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  id="fixed-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {FIXED_EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                id="fixed-amount"
                type="number"
                min="0"
                step="0.01"
                label="Monto"
                placeholder="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-700">Pagado por</p>
                <PaidByToggle
                  users={users}
                  value={effectivePaidBy}
                  onChange={setFormPaidBy}
                />
              </div>
              <Button type="submit" className="sm:col-span-2" disabled={submittingExpense}>
                {submittingExpense ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Agregar gasto fijo
                  </>
                )}
              </Button>
            </form>

            {fixedExpenses.length > 0 && (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {fixedExpenses.map((expense) => {
                  const payer = users.find((u) => u.id === expense.paid_by_user_id)
                  return (
                    <li
                      key={expense.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {getFixedCategoryLabel(expense.category)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Pagó {getFirstName(payer?.name)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          $ {formatAmountDisplay(Number(expense.amount))}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="space-y-4 border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white">
            <h2 className="text-sm font-semibold text-slate-900">Resumen de liquidación fija</h2>
            <p className="text-2xl font-bold text-slate-900">
              Total fijos: $ {formatAmountDisplay(settlement.total)}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[userA, userB].map((user) => (
                <div key={user.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">{getFirstName(user.name)}</p>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Le corresponde pagar</dt>
                      <dd className="font-medium text-slate-900">
                        $ {formatAmountDisplay(settlement.shouldPay[user.id])}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Pagó realmente</dt>
                      <dd className="font-medium text-slate-900">
                        $ {formatAmountDisplay(settlement.paid[user.id])}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1">
                      <dt className="text-slate-500">Balance</dt>
                      <dd
                        className={`font-semibold ${
                          (settlement.balance[user.id] ?? 0) >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {(settlement.balance[user.id] ?? 0) >= 0 ? '+' : '-'} ${' '}
                        {formatAmountDisplay(Math.abs(settlement.balance[user.id] ?? 0))}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            {settlementMessage && (
              <p className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-indigo-900">
                {settlementMessage}
              </p>
            )}
          </Card>
        </div>
      )}
    </PageWrapper>
  )
}
