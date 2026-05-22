import { supabase } from '../lib/supabaseClient'

export async function fetchDailyExpenses({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('daily_expenses')
    .select(
      'id, date, description, amount, category, currency, split_for, paid_by_user_id, created_at',
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

const EXPENSE_FIELDS =
  'id, date, description, amount, category, currency, split_for, paid_by_user_id, created_at'

export async function createDailyExpense(expense) {
  const { data, error } = await supabase
    .from('daily_expenses')
    .insert(expense)
    .select(EXPENSE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function updateDailyExpense(id, expense) {
  const { data, error } = await supabase
    .from('daily_expenses')
    .update(expense)
    .eq('id', id)
    .select(EXPENSE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function deleteDailyExpense(id) {
  const { error } = await supabase.from('daily_expenses').delete().eq('id', id)
  if (error) throw error
}
