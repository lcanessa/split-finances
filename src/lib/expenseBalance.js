import { formatAmountDisplay } from './safeMathEval'

export function getFirstName(name) {
  return name?.split(' ')[0] ?? name
}

/**
 * Balance neto por usuario: positivo = le deben, negativo = debe.
 */
export function calculateBalances(expenses, users) {
  const balance = Object.fromEntries(users.map((u) => [u.id, 0]))
  const paidTotal = Object.fromEntries(users.map((u) => [u.id, 0]))
  const shareTotal = Object.fromEntries(users.map((u) => [u.id, 0]))

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    const participants =
      expense.split_for?.length > 0
        ? expense.split_for
        : [expense.paid_by_user_id]
    const share = amount / participants.length

    paidTotal[expense.paid_by_user_id] =
      (paidTotal[expense.paid_by_user_id] ?? 0) + amount
    balance[expense.paid_by_user_id] =
      (balance[expense.paid_by_user_id] ?? 0) + amount

    for (const userId of participants) {
      balance[userId] = (balance[userId] ?? 0) - share
      shareTotal[userId] = (shareTotal[userId] ?? 0) + share
    }
  }

  const totalAll = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return { balance, paidTotal, shareTotal, totalAll }
}

export function getSettlement(users, balance) {
  if (users.length !== 2) return { settled: true, message: null }

  const [userA, userB] = users
  const balA = balance[userA.id] ?? 0
  const balB = balance[userB.id] ?? 0

  if (Math.abs(balA) < 0.01 && Math.abs(balB) < 0.01) {
    return { settled: true, message: 'Están a mano. No hay deudas pendientes.' }
  }

  const creditor = balA > 0 ? userA : userB
  const debtor = balA > 0 ? userB : userA
  const amount = Math.abs(balA > 0 ? balB : balA)

  return {
    settled: false,
    creditor,
    debtor,
    amount,
    message: `${getFirstName(debtor.name)} le debe ${formatAmountDisplay(amount)} a ${getFirstName(creditor.name)}`,
  }
}
