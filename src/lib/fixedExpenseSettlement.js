import { FIXED_EXPENSE_CATEGORIES } from './fixedExpenseCategories'
import { formatAmountDisplay } from './safeMathEval'
import { getFirstName } from './expenseBalance'

export function calculateSalaryPercentages(salaryA, salaryB) {
  const a = Number(salaryA) || 0
  const b = Number(salaryB) || 0
  const total = a + b

  if (total <= 0) {
    return { percentA: 0, percentB: 0, total: 0, salaryA: a, salaryB: b }
  }

  return {
    percentA: (a / total) * 100,
    percentB: (b / total) * 100,
    total,
    salaryA: a,
    salaryB: b,
  }
}

import { resolveCoupleUsers } from './coupleUsers'

function initUserMap(users, initial = 0) {
  return Object.fromEntries(users.map((u) => [u.id, initial]))
}

function initCategoryMap(categories, initial = 0) {
  return Object.fromEntries(categories.map((c) => [c.id, initial]))
}

function getSplitPercentsForCategory(categoryId, users, percentByUserId) {
  const category = FIXED_EXPENSE_CATEGORIES.find((c) => c.id === categoryId)
  if (category?.split === 'equal' && users.length === 2) {
    return Object.fromEntries(users.map((u) => [u.id, 50]))
  }
  return percentByUserId
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

/**
 * Liquidación detallada al estilo Excel: montos por categoría, cuota por sueldo
 * (u 50/50 en Otros), excedente y balance según quién pagó cada factura.
 *
 * @param {object} splitBalance - monthly_balances del mes anterior (ingresos que rigen la proporción)
 * @param {object|null} incomeBalance - mismos ingresos usados para calcular excedente
 */
export function buildFixedExpenseDetailReport({
  expenses,
  users,
  splitBalance,
  incomeBalance,
}) {
  const { userA, userB } = resolveCoupleUsers(users)

  const splitPercents = calculateSalaryPercentages(
    splitBalance?.salary_user_a ?? 0,
    splitBalance?.salary_user_b ?? 0,
  )

  const percentByUserId =
    userA && userB && splitPercents.total > 0
      ? { [userA.id]: splitPercents.percentA, [userB.id]: splitPercents.percentB }
      : userA && userB
        ? { [userA.id]: 50, [userB.id]: 50 }
        : {}

  const incomePercents = calculateSalaryPercentages(
    incomeBalance?.salary_user_a ?? splitBalance?.salary_user_a ?? 0,
    incomeBalance?.salary_user_b ?? splitBalance?.salary_user_b ?? 0,
  )

  const incomeByUserId =
    userA && userB
      ? { [userA.id]: incomePercents.salaryA, [userB.id]: incomePercents.salaryB }
      : {}

  const montos = initCategoryMap(FIXED_EXPENSE_CATEGORIES)
  const paidByCategory = Object.fromEntries(
    FIXED_EXPENSE_CATEGORIES.map((c) => [c.id, initUserMap(users)]),
  )
  const paid = initUserMap(users)

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    const category = expense.category ?? 'otros'
    montos[category] = (montos[category] ?? 0) + amount
    paid[expense.paid_by_user_id] = (paid[expense.paid_by_user_id] ?? 0) + amount

    if (paidByCategory[category]) {
      paidByCategory[category][expense.paid_by_user_id] =
        (paidByCategory[category][expense.paid_by_user_id] ?? 0) + amount
    }
  }

  const total = FIXED_EXPENSE_CATEGORIES.reduce(
    (sum, cat) => sum + (montos[cat.id] ?? 0),
    0,
  )

  const userRows = users.map((user) => {
    const shares = initCategoryMap(FIXED_EXPENSE_CATEGORIES)

    for (const cat of FIXED_EXPENSE_CATEGORIES) {
      const categoryAmount = montos[cat.id] ?? 0
      if (categoryAmount <= 0) continue

      const splitPercentsForCat = getSplitPercentsForCategory(
        cat.id,
        users,
        percentByUserId,
      )
      shares[cat.id] = roundMoney(
        (categoryAmount * (splitPercentsForCat[user.id] ?? 0)) / 100,
      )
    }

    const totalShare = roundMoney(
      FIXED_EXPENSE_CATEGORIES.reduce((sum, cat) => sum + (shares[cat.id] ?? 0), 0),
    )
    const income = incomeByUserId[user.id] ?? 0
    const expensePercentOfIncome =
      income > 0 ? roundMoney((totalShare / income) * 10000) / 100 : null
    const excedente = income > 0 ? roundMoney(income - totalShare) : null

    return {
      userId: user.id,
      shares,
      totalShare,
      expensePercentOfIncome,
      excedente,
      paid: roundMoney(paid[user.id] ?? 0),
      balance: roundMoney((paid[user.id] ?? 0) - totalShare),
    }
  })

  const shouldPay = Object.fromEntries(
    userRows.map((row) => [row.userId, row.totalShare]),
  )

  const balance = Object.fromEntries(
    userRows.map((row) => [row.userId, row.balance]),
  )

  return {
    categories: FIXED_EXPENSE_CATEGORIES,
    montos,
    total,
    paidByCategory,
    splitPercents,
    incomeByUserId,
    percentByUserId,
    userRows,
    shouldPay,
    paid,
    balance,
    usesFallbackSplit: splitPercents.total <= 0,
  }
}

/** @deprecated Usar buildFixedExpenseDetailReport */
export function calculateFixedSettlement(fixedExpenses, users, percentByUserId) {
  const total = fixedExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const shouldPay = Object.fromEntries(
    users.map((u) => [u.id, (total * (percentByUserId[u.id] ?? 0)) / 100]),
  )

  const paid = Object.fromEntries(users.map((u) => [u.id, 0]))
  for (const expense of fixedExpenses) {
    paid[expense.paid_by_user_id] =
      (paid[expense.paid_by_user_id] ?? 0) + Number(expense.amount)
  }

  const balance = Object.fromEntries(
    users.map((u) => [u.id, paid[u.id] - shouldPay[u.id]]),
  )

  return { total, shouldPay, paid, balance }
}

export function getFixedSettlementMessage(users, balance) {
  if (users.length !== 2) return null

  const { userA, userB } = resolveCoupleUsers(users)
  const balA = balance[userA.id] ?? 0
  const balB = balance[userB.id] ?? 0

  if (Math.abs(balA) < 0.01 && Math.abs(balB) < 0.01) {
    return {
      settled: true,
      message: 'En gastos fijos están a mano.',
    }
  }

  const creditor = balA > 0 ? userA : userB
  const debtor = balA > 0 ? userB : userA
  const amount = Math.abs(balA > 0 ? balB : balA)

  return {
    settled: false,
    creditor,
    debtor,
    amount,
    message: `Pago final ${getFirstName(debtor.name)} → ${getFirstName(creditor.name)}`,
    detail: `$ ${formatAmountDisplay(amount)}`,
  }
}
