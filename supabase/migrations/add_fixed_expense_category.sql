-- Categoría en gastos fijos (si la columna no existe aún)

ALTER TABLE fixed_expenses
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'otros';
