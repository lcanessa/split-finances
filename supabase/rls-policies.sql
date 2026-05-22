-- =============================================================================
-- Row Level Security (RLS) — Split Finances
-- Ejecutar en: Supabase → SQL Editor → Run
--
-- Requisito: la app debe usar Supabase Auth (usuario logueado).
-- Sin sesión autenticada, el rol "anon" no tendrá acceso a ninguna tabla.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Eliminar políticas anteriores (desarrollo / anon) si existen
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_select_users" ON users;
DROP POLICY IF EXISTS "anon_insert_users" ON users;

-- Por si re-ejecutás este script
DROP POLICY IF EXISTS "authenticated_select_users" ON users;
DROP POLICY IF EXISTS "authenticated_insert_users" ON users;
DROP POLICY IF EXISTS "authenticated_update_users" ON users;
DROP POLICY IF EXISTS "authenticated_delete_users" ON users;

DROP POLICY IF EXISTS "authenticated_select_monthly_balances" ON monthly_balances;
DROP POLICY IF EXISTS "authenticated_insert_monthly_balances" ON monthly_balances;
DROP POLICY IF EXISTS "authenticated_update_monthly_balances" ON monthly_balances;
DROP POLICY IF EXISTS "authenticated_delete_monthly_balances" ON monthly_balances;

DROP POLICY IF EXISTS "authenticated_select_daily_expenses" ON daily_expenses;
DROP POLICY IF EXISTS "authenticated_insert_daily_expenses" ON daily_expenses;
DROP POLICY IF EXISTS "authenticated_update_daily_expenses" ON daily_expenses;
DROP POLICY IF EXISTS "authenticated_delete_daily_expenses" ON daily_expenses;

DROP POLICY IF EXISTS "authenticated_select_fixed_expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "authenticated_insert_fixed_expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "authenticated_update_fixed_expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "authenticated_delete_fixed_expenses" ON fixed_expenses;

DROP POLICY IF EXISTS "authenticated_select_credit_purchases" ON credit_purchases;
DROP POLICY IF EXISTS "authenticated_insert_credit_purchases" ON credit_purchases;
DROP POLICY IF EXISTS "authenticated_update_credit_purchases" ON credit_purchases;
DROP POLICY IF EXISTS "authenticated_delete_credit_purchases" ON credit_purchases;

DROP POLICY IF EXISTS "authenticated_select_installments" ON installments;
DROP POLICY IF EXISTS "authenticated_insert_installments" ON installments;
DROP POLICY IF EXISTS "authenticated_update_installments" ON installments;
DROP POLICY IF EXISTS "authenticated_delete_installments" ON installments;

-- -----------------------------------------------------------------------------
-- 2. Habilitar RLS en todas las tablas
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. Políticas para: users
-- -----------------------------------------------------------------------------
CREATE POLICY "authenticated_select_users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. Políticas para: monthly_balances
-- -----------------------------------------------------------------------------
CREATE POLICY "authenticated_select_monthly_balances"
  ON monthly_balances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_monthly_balances"
  ON monthly_balances FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_monthly_balances"
  ON monthly_balances FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_monthly_balances"
  ON monthly_balances FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 5. Políticas para: daily_expenses
-- -----------------------------------------------------------------------------
CREATE POLICY "authenticated_select_daily_expenses"
  ON daily_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_daily_expenses"
  ON daily_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_daily_expenses"
  ON daily_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_daily_expenses"
  ON daily_expenses FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 6. Políticas para: fixed_expenses
-- -----------------------------------------------------------------------------
CREATE POLICY "authenticated_select_fixed_expenses"
  ON fixed_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_fixed_expenses"
  ON fixed_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_fixed_expenses"
  ON fixed_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_fixed_expenses"
  ON fixed_expenses FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 7. Políticas para: credit_purchases
-- -----------------------------------------------------------------------------
CREATE POLICY "authenticated_select_credit_purchases"
  ON credit_purchases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_credit_purchases"
  ON credit_purchases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_credit_purchases"
  ON credit_purchases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_credit_purchases"
  ON credit_purchases FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 8. Políticas para: installments
-- -----------------------------------------------------------------------------
CREATE POLICY "authenticated_select_installments"
  ON installments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_installments"
  ON installments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_installments"
  ON installments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_installments"
  ON installments FOR DELETE
  TO authenticated
  USING (true);
