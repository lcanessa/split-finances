-- Corregir sueldos invertidos en monthly_balances (solo si salary_user_a tiene el sueldo de Lichi).
-- Ejecutar en Supabase SQL Editor si después del fix de la app los valores siguen cruzados.

UPDATE monthly_balances
SET
  salary_user_a = salary_user_b,
  salary_user_b = salary_user_a;

-- Verificación sugerida (nov 2023): salary_user_a ≈ 468210 (Mati), salary_user_b ≈ 1229256 (Lichi)
-- SELECT month, year, salary_user_a, salary_user_b FROM monthly_balances WHERE month = 11 AND year = 2023;
