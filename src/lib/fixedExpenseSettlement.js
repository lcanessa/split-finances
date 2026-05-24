import { formatAmountDisplay } from './safeMathEval'
import { getFirstName } from './expenseBalance'

export function calculateSalaryPercentages(salaryA, salaryB) {
  const a = Number(salaryA) || 0
  const b = Number(salaryB) || 0
  const total = a + b

  if (total <= 0) {
    return { percentA: 0, percentB: 0, total: 0 }
  }

  return {
    percentA: (a / total) * 100,
    percentB: (b / total) * 100,
    total,
  }
}

/**
 * @param {Array} fixedExpenses
 * @param {Array} users - exactamente 2 usuarios, en el mismo orden que los sueldos
 * @param {{ [userId: string]: number }} percentByUserId - porcentajes 0-100
 */
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

  const [userA, userB] = users
  const balA = balance[userA.id] ?? 0
  const balB = balance[userB.id] ?? 0

  if (Math.abs(balA) < 0.01 && Math.abs(balB) < 0.01) {
    return 'En gastos fijos están a mano.'
  }

  const creditor = balA > 0 ? userA : userB
  const debtor = balA > 0 ? userB : userA
  const amount = Math.abs(balA > 0 ? balB : balA)

  return `${getFirstName(debtor.name)} le debe ${formatAmountDisplay(amount)} a ${getFirstName(creditor.name)} en fijos`
}
