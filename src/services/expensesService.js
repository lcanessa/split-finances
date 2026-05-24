import { supabase } from '../lib/supabaseClient'

const EXPENSE_FIELDS =
  'id, date, description, amount, category, currency, split_for, paid_by_user_id, created_at'

function getMonthDateRange(month, year) {
  const monthStr = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  return {
    start: `${year}-${monthStr}-01`,
    end: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
  }
}

export async function fetchDailyExpenses({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('daily_expenses')
    .select(EXPENSE_FIELDS)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function fetchDailyExpensesByMonth(month, year) {
  const { start, end } = getMonthDateRange(month, year)
  const { data, error } = await supabase
    .from('daily_expenses')
    .select(EXPENSE_FIELDS)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

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
