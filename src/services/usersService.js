import { supabase } from '../lib/supabaseClient'

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function createUser({ name, email }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, email })
    .select('id, name, email, created_at')
    .single()

  if (error) throw error
  return data
}
