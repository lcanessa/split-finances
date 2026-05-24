# Importación de GastosFijos.csv

Datos históricos del Excel → Supabase (`monthly_balances` + `fixed_expenses`).

## Qué se importa

| CSV | Supabase |
|-----|----------|
| `INGRESOS NOV 23` (sueldos Mati/Lichi) | `monthly_balances` mes 11/2023 |
| `GASTOS DEC 23` (montos por categoría) | `fixed_expenses` mes 12/2023 |

- **31 meses** de ingresos (nov 2023 → may 2026)
- **31 meses** de gastos (dic 2023 → jun 2026)
- **182** registros de gastos fijos
- Categorías múltiples de "Otros" se suman en una sola fila `otros`
- `GAS` del Excel se guarda como `otros`
- Montos negativos (reintegros) se omiten

## Convención Mati / Lichi

- `salary_user_a` = sueldo de **Mati**
- `salary_user_b` = sueldo de **Lichi**

La app resuelve usuarios por nombre (`resolveCoupleUsers`), no por el orden de la tabla `users`.

Si en Supabase ves los montos invertidos (ej. nov 2023: `salary_user_a` ≈ 1.229.256 en lugar de ≈ 468.210), ejecutá `supabase/migrations/fix_swap_salary_users.sql` una sola vez.

## Pagado por (`paid_by_user_id`)

El CSV no dice quién pagó cada factura. El importador usa:

1. Si hay **"Pago final X → Y"** → asigna todo al acreedor **Y** (quien adelantó plata)
2. Si no → asigna todo a **Lichi** (convención por defecto)

Podés corregir meses puntuales en la app después del import.

## Opción A — SQL en Supabase (recomendada)

```bash
npm run import:gastos-fijos:sql
```

Abrí `supabase/migrations/import_gastos_fijos_data.sql` en **Supabase → SQL Editor** y ejecutalo.
Requiere que existan usuarios con "Mati" y "Lichi" en el nombre.

## Opción B — Script directo

Agregá a tu `.env` local (no commitear):

```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Luego:

```bash
npm run import:gastos-fijos:dry    # preview
npm run import:gastos-fijos       # importa (--replace borra esos meses antes)
```

Alternativa con usuario auth:

```
IMPORT_USER_EMAIL=tu@mail.com
IMPORT_USER_PASSWORD=tu-clave
```
