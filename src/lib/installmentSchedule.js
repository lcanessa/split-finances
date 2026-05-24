/**
 * Genera mes/año para cada cuota a partir de la primera.
 */
export function generateInstallmentSchedule(startMonth, startYear, count) {
  const schedule = []

  for (let i = 0; i < count; i += 1) {
    const monthIndex = startMonth - 1 + i
    schedule.push({
      installment_number: i + 1,
      month: (monthIndex % 12) + 1,
      year: startYear + Math.floor(monthIndex / 12),
    })
  }

  return schedule
}

/**
 * Divide el monto total en cuotas. La última absorbe diferencias de redondeo.
 */
export function splitInstallmentAmounts(totalAmount, count) {
  const total = Number(totalAmount)
  const installments = Number(count)
  const unit = Math.round((total / installments) * 100) / 100
  const amounts = Array.from({ length: installments }, () => unit)

  if (installments > 0) {
    const sumExceptLast = unit * (installments - 1)
    amounts[installments - 1] = Math.round((total - sumExceptLast) * 100) / 100
  }

  return amounts
}
