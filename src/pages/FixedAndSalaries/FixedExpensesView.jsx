import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { FixedExpenseMonthlySheet } from '../../components/fixedExpenses/FixedExpenseMonthlySheet'
import { FixedExpensesHistory } from '../../components/fixedExpenses/FixedExpensesHistory'
import { PaidByToggle } from '../../components/shared/PaidByToggle'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../hooks/useApp'
import { resolveCoupleUsers } from '../../lib/coupleUsers'
import { buildMonthlySheetData } from '../../lib/buildMonthlySheetData'
import { FIXED_EXPENSE_CATEGORIES } from '../../lib/fixedExpenseCategories'
import { sumExpensesByCategory } from '../../lib/percentChange'
import { getFixedSettlementMessage } from '../../lib/fixedExpenseSettlement'
import {
  getPeriodLabel,
  getPreviousPeriod,
} from '../../lib/periodUtils'
import {
  createFixedExpense,
  fetchAllFixedExpenses,
  fetchAllMonthlyBalances,
  fetchFixedExpenses,
  fetchMonthlyBalance,
  upsertFixedExpenseByCategory,
  upsertMonthlyBalance,
} from '../../services/fixedExpensesService'
import { PeriodSelector } from './PeriodSelector'

const now = new Date()

export function FixedExpensesView() {
  const { users, activeUser } = useApp()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [salaryA, setSalaryA] = useState('')
  const [salaryB, setSalaryB] = useState('')
  const [fixedExpenses, setFixedExpenses] = useState([])
  const [splitBalance, setSplitBalance] = useState(null)
  const [prevIncomeBalance, setPrevIncomeBalance] = useState(null)
  const [prevExpenses, setPrevExpenses] = useState([])
  const [categoryDrafts, setCategoryDrafts] = useState({})
  const [allBalances, setAllBalances] = useState([])
  const [allExpenses, setAllExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [savingSalaries, setSavingSalaries] = useState(false)
  const [error, setError] = useState(null)

  const [formCategory, setFormCategory] = useState('alquiler')
  const [formAmount, setFormAmount] = useState('')
  const [formPaidBy, setFormPaidBy] = useState('')
  const [submittingExpense, setSubmittingExpense] = useState(false)

  const { userA } = resolveCoupleUsers(users)

  const prevPeriod = getPreviousPeriod(month, year)
  const prevPrevPeriod = getPreviousPeriod(prevPeriod.month, prevPeriod.year)

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError(null)
      try {
        const [expenses, previousBalance, olderBalance, previousExpenses] =
          await Promise.all([
            fetchFixedExpenses(month, year),
            fetchMonthlyBalance(prevPeriod.month, prevPeriod.year),
            fetchMonthlyBalance(prevPrevPeriod.month, prevPrevPeriod.year),
            fetchFixedExpenses(prevPeriod.month, prevPeriod.year),
          ])
        if (cancelled) return
        setSalaryA(previousBalance ? String(previousBalance.salary_user_a) : '')
        setSalaryB(previousBalance ? String(previousBalance.salary_user_b) : '')
        setFixedExpenses(expenses)
        setSplitBalance(previousBalance)
        setPrevIncomeBalance(olderBalance)
        setPrevExpenses(previousExpenses)
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
  }, [month, year, prevPeriod.month, prevPeriod.year, prevPrevPeriod.month, prevPrevPeriod.year])

  const montosByCategory = useMemo(
    () => sumExpensesByCategory(fixedExpenses),
    [fixedExpenses],
  )

  function getCategoryDraftValue(categoryId) {
    if (categoryId in categoryDrafts) return categoryDrafts[categoryId]
    const amount = montosByCategory[categoryId]
    return amount > 0 ? String(amount) : ''
  }

  const categoryDraftValues = useMemo(
    () =>
      Object.fromEntries(
        FIXED_EXPENSE_CATEGORIES.map((cat) => [cat.id, getCategoryDraftValue(cat.id)]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drafts override montos
    [categoryDrafts, montosByCategory],
  )

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      setHistoryLoading(true)
      try {
        const [balances, expenses] = await Promise.all([
          fetchAllMonthlyBalances(),
          fetchAllFixedExpenses(),
        ])
        if (!cancelled) {
          setAllBalances(balances)
          setAllExpenses(expenses)
        }
      } catch {
        if (!cancelled) {
          setAllBalances([])
          setAllExpenses([])
        }
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [])

  const effectivePaidBy = formPaidBy || activeUser?.id || userA?.id || ''

  const sheetData = useMemo(
    () =>
      users.length >= 2
        ? buildMonthlySheetData({
            users,
            incomeBalance: splitBalance,
            prevIncomeBalance,
            expenses: fixedExpenses,
            prevExpenses,
            splitBalance,
          })
        : null,
    [fixedExpenses, users, splitBalance, prevIncomeBalance, prevExpenses],
  )

  const report = sheetData?.report ?? null

  const settlementMessage = useMemo(
    () => (report ? getFixedSettlementMessage(users, report.balance) : null),
    [report, users],
  )

  async function refreshPeriodData() {
    const [expenses, previousBalance, olderBalance, previousExpenses] =
      await Promise.all([
        fetchFixedExpenses(month, year),
        fetchMonthlyBalance(prevPeriod.month, prevPeriod.year),
        fetchMonthlyBalance(prevPrevPeriod.month, prevPrevPeriod.year),
        fetchFixedExpenses(prevPeriod.month, prevPeriod.year),
      ])
    setFixedExpenses(expenses)
    setSplitBalance(previousBalance)
    setPrevIncomeBalance(olderBalance)
    setPrevExpenses(previousExpenses)
    setSalaryA(previousBalance ? String(previousBalance.salary_user_a) : '')
    setSalaryB(previousBalance ? String(previousBalance.salary_user_b) : '')
  }

  async function refreshHistoryData() {
    const [balances, expenses] = await Promise.all([
      fetchAllMonthlyBalances(),
      fetchAllFixedExpenses(),
    ])
    setAllBalances(balances)
    setAllExpenses(expenses)
  }

  async function saveSalaries(valuesA, valuesB) {
    setSavingSalaries(true)
    try {
      await upsertMonthlyBalance({
        month: prevPeriod.month,
        year: prevPeriod.year,
        salary_user_a: Number(valuesA) || 0,
        salary_user_b: Number(valuesB) || 0,
      })
      await refreshHistoryData()
    } catch (err) {
      setError(err.message ?? 'No se pudieron guardar los sueldos')
    } finally {
      setSavingSalaries(false)
    }
  }

  function handleSalaryBlur() {
    saveSalaries(salaryA, salaryB)
  }

  function handleCategoryAmountChange(categoryId, value) {
    setCategoryDrafts((prev) => ({ ...prev, [categoryId]: value }))
  }

  async function handleCategoryAmountBlur(categoryId) {
    const amount = Number(getCategoryDraftValue(categoryId)) || 0
    try {
      await upsertFixedExpenseByCategory({
        month,
        year,
        category: categoryId,
        amount,
        paid_by_user_id: effectivePaidBy,
      })
      setCategoryDrafts((prev) => {
        const next = { ...prev }
        delete next[categoryId]
        return next
      })
      await refreshPeriodData()
      await refreshHistoryData()
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar el monto')
    }
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
      await refreshPeriodData()
      await refreshHistoryData()
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar el gasto')
    } finally {
      setSubmittingExpense(false)
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
          {sheetData && (
            <Card className="p-3 sm:p-4">
              <FixedExpenseMonthlySheet
                users={users}
                month={month}
                year={year}
                incomePeriod={prevPeriod}
                prevExpensesPeriod={prevPeriod}
                sheetData={sheetData}
                salaryA={salaryA}
                salaryB={salaryB}
                onSalaryAChange={setSalaryA}
                onSalaryBChange={setSalaryB}
                onSalaryBlur={handleSalaryBlur}
                onCategoryAmountChange={handleCategoryAmountChange}
                onCategoryAmountBlur={handleCategoryAmountBlur}
                categoryDrafts={categoryDraftValues}
                savingSalaries={savingSalaries}
              />
              <p className="mt-3 text-[11px] text-slate-500">
                Editá los montos en la fila Monto. Se guardan al salir del campo. Ingresos de{' '}
                {getPeriodLabel(prevPeriod.month, prevPeriod.year)} rigen la liquidación de{' '}
                {getPeriodLabel(month, year)}.
              </p>
            </Card>
          )}

          <Card className="space-y-3 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Pagado por (gastos del mes)</h2>
            <PaidByToggle users={users} value={effectivePaidBy} onChange={setFormPaidBy} />
            <form onSubmit={handleAddExpense} className="flex flex-wrap gap-2">
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="sheet-input min-w-[8rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 md:text-sm"
              >
                {FIXED_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <Input
                id="fixed-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="max-w-[8rem]"
                required
              />
              <Button type="submit" disabled={submittingExpense}>
                {submittingExpense ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Card>

          {report && settlementMessage && (
            <Card
              className={`p-4 text-center ${
                settlementMessage.settled
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <p className="text-sm font-semibold">{settlementMessage.message}</p>
              {!settlementMessage.settled && (
                <p className="mt-2 text-2xl font-bold">{settlementMessage.detail}</p>
              )}
              {report.usesFallbackSplit && (
                <p className="mt-2 text-xs text-amber-800">
                  Cargá ingresos de {getPeriodLabel(prevPeriod.month, prevPeriod.year)} para la
                  proporción exacta.
                </p>
              )}
            </Card>
          )}

          <Card className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Historial de meses</h2>
              <p className="mt-1 text-xs text-slate-500">
                Resumen de meses anteriores — tocá uno para ver el detalle.
              </p>
            </div>
            {historyLoading ? (
              <p className="py-4 text-center text-sm text-slate-500">Cargando historial...</p>
            ) : (
              <FixedExpensesHistory
                users={users}
                allBalances={allBalances}
                allExpenses={allExpenses}
                currentMonth={month}
                currentYear={year}
                onSelectPeriod={(m, y) => {
                  setMonth(m)
                  setYear(y)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </Card>
        </div>

      )}
    </PageWrapper>
  )
}
