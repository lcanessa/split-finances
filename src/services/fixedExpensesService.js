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

export async function upsertFixedExpenseByCategory({
  month,
  year,
  category,
  amount,
  paid_by_user_id,
}) {
  const { data: existing, error: fetchError } = await supabase
    .from('fixed_expenses')
    .select('id')
    .eq('month', month)
    .eq('year', year)
    .eq('category', category)

  if (fetchError) throw fetchError

  const ids = (existing ?? []).map((row) => row.id)

  if (amount <= 0) {
    if (ids.length > 0) {
      const { error } = await supabase.from('fixed_expenses').delete().in('id', ids)
      if (error) throw error
    }
    return null
  }

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .update({ amount, paid_by_user_id })
      .eq('id', ids[0])
      .select(EXPENSE_FIELDS)
      .single()
    if (error) throw error

    if (ids.length > 1) {
      const { error: deleteError } = await supabase
        .from('fixed_expenses')
        .delete()
        .in('id', ids.slice(1))
      if (deleteError) throw deleteError
    }
    return data
  }

  const { data, error } = await supabase
    .from('fixed_expenses')
    .insert({ month, year, category, amount, paid_by_user_id })
    .select(EXPENSE_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function fetchAllMonthlyBalances() {
  const { data, error } = await supabase
    .from('monthly_balances')
    .select(BALANCE_FIELDS)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchAllFixedExpenses() {
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select(EXPENSE_FIELDS)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error
  return data ?? []
}
