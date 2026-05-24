import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { resolveCoupleUsers } from '../../lib/coupleUsers'
import { getFirstName } from '../../lib/expenseBalance'
import {
  buildFixedExpenseDetailReport,
  getFixedSettlementMessage,
} from '../../lib/fixedExpenseSettlement'
import { getPeriodLabel, periodKey, sortPeriodsDesc } from '../../lib/periodUtils'
import { formatAmountDisplay } from '../../lib/safeMathEval'

function buildBalanceMap(balances) {
  return Object.fromEntries(balances.map((b) => [periodKey(b.month, b.year), b]))
}

function groupExpensesByPeriod(expenses) {
  const groups = {}
  for (const expense of expenses) {
    const key = periodKey(expense.month, expense.year)
    if (!groups[key]) groups[key] = []
    groups[key].push(expense)
  }
  return groups
}

function getPreviousBalanceKey(month, year) {
  if (month === 1) return periodKey(12, year - 1)
  return periodKey(month - 1, year)
}

export function FixedExpensesHistory({
  users,
  allBalances,
  allExpenses,
  currentMonth,
  currentYear,
  onSelectPeriod,
}) {
  const historyItems = useMemo(() => {
    if (users.length < 2) return []

    const balanceMap = buildBalanceMap(allBalances)
    const expenseGroups = groupExpensesByPeriod(allExpenses)
    const periodKeys = new Set([
      ...allBalances.map((b) => periodKey(b.month, b.year)),
      ...Object.keys(expenseGroups),
    ])

    const periods = [...periodKeys].map((key) => {
      const [yearStr, monthStr] = key.split('-')
      return { month: Number(monthStr), year: Number(yearStr), key }
    })

    return sortPeriodsDesc(periods)
      .filter((p) => !(p.month === currentMonth && p.year === currentYear))
      .map(({ month, year, key }) => {
        const expenses = expenseGroups[key] ?? []
        const splitBalance = balanceMap[getPreviousBalanceKey(month, year)] ?? null
        const incomeBalance = splitBalance

        const report =
          expenses.length > 0
            ? buildFixedExpenseDetailReport({
                expenses,
                users,
                splitBalance,
                incomeBalance,
              })
            : null

        const verdict = report
          ? getFixedSettlementMessage(users, report.balance)
          : null

        return {
          month,
          year,
          key,
          expenseCount: expenses.length,
          total: report?.total ?? 0,
          report,
          verdict,
          hasSalaries: Boolean(splitBalance),
        }
      })
      .filter((item) => item.expenseCount > 0 || item.hasSalaries)
  }, [allBalances, allExpenses, currentMonth, currentYear, users])

  if (historyItems.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay meses anteriores con datos cargados.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {historyItems.map((item) => {
        const { userA, userB } = resolveCoupleUsers(users)
        const rowA = item.report?.userRows.find((r) => r.userId === userA?.id)
        const rowB = item.report?.userRows.find((r) => r.userId === userB?.id)

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectPeriod(item.month, item.year)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {getPeriodLabel(item.month, item.year)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {item.expenseCount} gasto{item.expenseCount !== 1 ? 's' : ''}
                {item.total > 0 && (
                  <>
                    {' '}
                    · Total $ {formatAmountDisplay(item.total)}
                  </>
                )}
              </p>
              {rowA && rowB && (
                <p className="mt-1 text-xs text-slate-600">
                  {getFirstName(userA.name)} excedente:{' '}
                  {rowA.excedente != null
                    ? `$ ${formatAmountDisplay(rowA.excedente)}`
                    : '—'}
                  {' · '}
                  {getFirstName(userB.name)} excedente:{' '}
                  {rowB.excedente != null
                    ? `$ ${formatAmountDisplay(rowB.excedente)}`
                    : '—'}
                </p>
              )}
              {item.verdict && !item.verdict.settled && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  {item.verdict.message}: {item.verdict.detail}
                </p>
              )}
              {item.verdict?.settled && item.expenseCount > 0 && (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {item.verdict.message}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        )
      })}
    </div>
  )
}
