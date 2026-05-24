import { fetchInstallmentsByMonth } from './creditCardsService'
import { fetchDailyExpensesByMonth } from './expensesService'
import { fetchFixedExpenses, fetchMonthlyBalance } from './fixedExpensesService'
import { getPreviousPeriod } from '../lib/periodUtils'

export async function fetchMonthlyDashboardData(month, year) {
  const prev = getPreviousPeriod(month, year)
  const [monthlyBalance, splitBalance, dailyExpenses, fixedExpenses, installments] =
    await Promise.all([
      fetchMonthlyBalance(month, year),
      fetchMonthlyBalance(prev.month, prev.year),
      fetchDailyExpensesByMonth(month, year),
      fetchFixedExpenses(month, year),
      fetchInstallmentsByMonth(month, year),
    ])

  return {
    monthlyBalance,
    splitBalance,
    dailyExpenses,
    fixedExpenses,
    installments,
  }
}
