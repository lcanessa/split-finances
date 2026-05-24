import { buildFixedExpenseDetailReport } from './fixedExpenseSettlement'

import { resolveCoupleUsers } from './coupleUsers'

function initUserMap(users, initial = 0) {
  return Object.fromEntries(users.map((u) => [u.id, initial]))
}

/**
 * Liquidación mensual combinada: día a día + fijos + tarjetas.
 */
export function calculateMonthlyBalance({
  users,
  splitBalance,
  dailyExpenses,
  fixedExpenses,
  installments,
}) {
  const paid = initUserMap(users, 0)
  const shouldPay = initUserMap(users, 0)

  let totalDaily = 0
  for (const expense of dailyExpenses) {
    const amount = Number(expense.amount)
    totalDaily += amount
    paid[expense.paid_by_user_id] = (paid[expense.paid_by_user_id] ?? 0) + amount

    const participants =
      expense.split_for?.length > 0
        ? expense.split_for
        : [expense.paid_by_user_id]
    const share = amount / participants.length
    for (const userId of participants) {
      shouldPay[userId] = (shouldPay[userId] ?? 0) + share
    }
  }

  const fixedReport = buildFixedExpenseDetailReport({
    expenses: fixedExpenses,
    users,
    splitBalance,
    incomeBalance: splitBalance,
  })

  for (const user of users) {
    shouldPay[user.id] = (shouldPay[user.id] ?? 0) + (fixedReport.shouldPay[user.id] ?? 0)
    paid[user.id] = (paid[user.id] ?? 0) + (fixedReport.paid[user.id] ?? 0)
  }

  const totalFixed = fixedReport.total

  let totalCards = 0
  for (const installment of installments) {
    const amount = Number(installment.amount)
    totalCards += amount
    const purchaserId = installment.credit_purchases?.purchased_by_user_id
    if (!purchaserId) continue

    shouldPay[purchaserId] = (shouldPay[purchaserId] ?? 0) + amount
    if (installment.settled) {
      paid[purchaserId] = (paid[purchaserId] ?? 0) + amount
    }
  }

  const balance = Object.fromEntries(
    users.map((user) => [user.id, paid[user.id] - shouldPay[user.id]]),
  )

  const totalSpent = totalDaily + totalFixed + totalCards

  return {
    totals: {
      all: totalSpent,
      daily: totalDaily,
      fixed: totalFixed,
      cards: totalCards,
    },
    paid,
    shouldPay,
    balance,
    salaryPercents: fixedReport.percentByUserId,
    fixedReport,
  }
}

export function getMonthlyVerdict(users, balance) {
  if (users.length !== 2) {
    return { settled: true, message: 'Configurá dos usuarios para ver el balance.' }
  }

  const { userA, userB } = resolveCoupleUsers(users)
  const balA = balance[userA.id] ?? 0
  const balB = balance[userB.id] ?? 0

  if (Math.abs(balA) < 0.01 && Math.abs(balB) < 0.01) {
    return {
      settled: true,
      message: 'Están a mano este mes. No hay transferencias pendientes.',
    }
  }

  const creditor = balA > 0 ? userA : userB
  const debtor = balA > 0 ? userB : userA
  const amount = Math.abs(balA > 0 ? balB : balA)
  const creditorName = creditor.name.split(' ')[0]
  const debtorName = debtor.name.split(' ')[0]

  return {
    settled: false,
    creditor,
    debtor,
    amount,
    message: `Para quedar a mano este mes, ${debtorName} le debe transferir a ${creditorName}`,
  }
}
