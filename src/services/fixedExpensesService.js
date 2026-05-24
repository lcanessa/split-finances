import { supabase } from '../lib/supabaseClient'

const BALANCE_FIELDS = 'id, month, year, salary_user_a, salary_user_b, created_at'
const EXPENSE_FIELDS =
  'id, month, year, category, amount, paid_by_user_id, created_at'

export async function fetchMonthlyBalance(month, year) {
  const { data, error } = await supabase
    .from('monthly_balances')
    .select(BALANCE_FIELDS)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertMonthlyBalance({ month, year, salary_user_a, salary_user_b }) {
  const { data, error } = await supabase
    .from('monthly_balances')
    .upsert(
      { month, year, salary_user_a, salary_user_b },
      { onConflict: 'month,year' },
    )
    .select(BALANCE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function fetchFixedExpenses(month, year) {
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select(EXPENSE_FIELDS)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createFixedExpense(expense) {
  const { data, error } = await supabase
    .from('fixed_expenses')
    .insert(expense)
    .select(EXPENSE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function deleteFixedExpense(id) {
  const { error } = await supabase.from('fixed_expenses').delete().eq('id', id)
  if (error) throw error
}
