import { supabase } from '../lib/supabaseClient'
import {
  generateInstallmentSchedule,
  splitInstallmentAmounts,
} from '../lib/installmentSchedule'

const PURCHASE_FIELDS =
  'id, description, total_amount, installments_count, purchased_by_user_id, purchase_date, created_at'

const INSTALLMENT_FIELDS =
  'id, purchase_id, installment_number, month, year, amount, settled, created_at'

export async function createCreditPurchaseWithInstallments({
  description,
  total_amount,
  installments_count,
  purchased_by_user_id,
  first_month,
  first_year,
}) {
  const schedule = generateInstallmentSchedule(
    first_month,
    first_year,
    installments_count,
  )
  const amounts = splitInstallmentAmounts(total_amount, installments_count)
  const purchaseDate = `${first_year}-${String(first_month).padStart(2, '0')}-01`

  const { data: purchase, error: purchaseError } = await supabase
    .from('credit_purchases')
    .insert({
      description,
      total_amount,
      installments_count,
      purchased_by_user_id,
      purchase_date: purchaseDate,
    })
    .select(PURCHASE_FIELDS)
    .single()

  if (purchaseError) throw purchaseError

  const installments = schedule.map((item, index) => ({
    purchase_id: purchase.id,
    installment_number: item.installment_number,
    month: item.month,
    year: item.year,
    amount: amounts[index],
    settled: false,
  }))

  const { error: installmentsError } = await supabase
    .from('installments')
    .insert(installments)

  if (installmentsError) {
    await supabase.from('credit_purchases').delete().eq('id', purchase.id)
    throw installmentsError
  }

  return purchase
}

export async function fetchInstallmentsByMonth(month, year) {
  const { data, error } = await supabase
    .from('installments')
    .select(`
      ${INSTALLMENT_FIELDS},
      credit_purchases (
        description,
        installments_count,
        purchased_by_user_id
      )
    `)
    .eq('month', month)
    .eq('year', year)
    .order('installment_number')

  if (error) throw error
  return data ?? []
}

export async function updateInstallmentSettled(id, settled) {
  const { data, error } = await supabase
    .from('installments')
    .update({ settled })
    .eq('id', id)
    .select(INSTALLMENT_FIELDS)
    .single()

  if (error) throw error
  return data
}
