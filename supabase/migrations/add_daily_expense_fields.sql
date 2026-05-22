-- Campos adicionales para gastos diarios (ejecutar en Supabase SQL Editor)

ALTER TABLE daily_expenses
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS split_for UUID[] NOT NULL DEFAULT '{}';
