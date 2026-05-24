import { fetchInstallmentsByMonth } from './creditCardsService'
import { fetchDailyExpensesByMonth } from './expensesService'
import { fetchFixedExpenses, fetchMonthlyBalance } from './fixedExpensesService'

export async function fetchMonthlyDashboardData(month, year) {
  const [monthlyBalance, dailyExpenses, fixedExpenses, installments] =
    await Promise.all([
      fetchMonthlyBalance(month, year),
      fetchDailyExpensesByMonth(month, year),
      fetchFixedExpenses(month, year),
      fetchInstallmentsByMonth(month, year),
    ])

  return {
    monthlyBalance,
    dailyExpenses,
    fixedExpenses,
    installments,
  }
}
