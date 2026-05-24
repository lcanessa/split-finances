import { FIXED_EXPENSE_CATEGORIES } from './fixedExpenseCategories'
import { buildFixedExpenseDetailReport, calculateSalaryPercentages } from './fixedExpenseSettlement'
import { calcPercentChange, sumExpensesByCategory, sumExpensesTotal } from './percentChange'

export function buildMonthlySheetData({
  users,
  incomeBalance,
  prevIncomeBalance,
  expenses,
  prevExpenses,
  splitBalance,
}) {
  const montos = sumExpensesByCategory(expenses)
  const prevMontos = sumExpensesByCategory(prevExpenses)
  const total = sumExpensesTotal(expenses)
  const prevTotal = sumExpensesTotal(prevExpenses)

  const income = calculateSalaryPercentages(
    incomeBalance?.salary_user_a ?? 0,
    incomeBalance?.salary_user_b ?? 0,
  )
  const prevIncome = calculateSalaryPercentages(
    prevIncomeBalance?.salary_user_a ?? 0,
    prevIncomeBalance?.salary_user_b ?? 0,
  )

  const report = buildFixedExpenseDetailReport({
    expenses,
    users,
    splitBalance,
    incomeBalance: splitBalance,
  })

  const prevReport =
    prevExpenses.length > 0
      ? buildFixedExpenseDetailReport({
          expenses: prevExpenses,
          users,
          splitBalance: prevIncomeBalance,
          incomeBalance: prevIncomeBalance,
        })
      : null

  const activeCategories = FIXED_EXPENSE_CATEGORIES.filter(
    (cat) => (montos[cat.id] ?? 0) > 0 || (prevMontos[cat.id] ?? 0) > 0,
  )
  const displayCategories =
    activeCategories.length > 0 ? activeCategories : FIXED_EXPENSE_CATEGORIES

  const categoryChanges = Object.fromEntries(
    displayCategories.map((cat) => [
      cat.id,
      calcPercentChange(montos[cat.id] ?? 0, prevMontos[cat.id] ?? 0),
    ]),
  )

  const expensesOverIncomePercent =
    income.total > 0 ? Math.round((total / income.total) * 10000) / 100 : null
  const prevExpensesOverIncomePercent =
    prevIncome.total > 0
      ? Math.round((prevTotal / prevIncome.total) * 10000) / 100
      : null

  return {
    displayCategories,
    montos,
    prevMontos,
    total,
    prevTotal,
    totalChange: calcPercentChange(total, prevTotal),
    expensesOverIncomePercent,
    prevExpensesOverIncomePercent,
    income,
    prevIncome,
    incomeChanges: {
      salaryA: calcPercentChange(income.salaryA, prevIncome.salaryA),
      salaryB: calcPercentChange(income.salaryB, prevIncome.salaryB),
      total: calcPercentChange(income.total, prevIncome.total),
    },
    categoryChanges,
    report,
    prevReport,
  }
}
