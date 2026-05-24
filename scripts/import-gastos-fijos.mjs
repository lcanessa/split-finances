/**
 * Parser + importador de GastosFijos.csv → Supabase
 *
 * Uso:
 *   node scripts/import-gastos-fijos.mjs --dry-run
 *   node scripts/import-gastos-fijos.mjs --execute
 *
 * Requiere en .env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  (recomendado para scripts)
 *   — o bien IMPORT_USER_EMAIL + IMPORT_USER_PASSWORD
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CSV_PATH = path.join(ROOT, 'data_temporal', 'GastosFijos.csv')

const MONTH_MAP = {
  ENE: 1,
  FEB: 2,
  MAR: 3,
  ABR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AGO: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DIC: 12,
  DEC: 12,
}

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return {}
  const env = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

function parseMoney(raw) {
  if (raw == null) return null
  const str = String(raw).trim()
  if (!str || str === '-' || str === '—') return null

  const negative = str.includes('-')
  const cleaned = str
    .replace(/[^\d,.-]/g, '')
    .replace(/^-/, '')
    .replace(/\./g, '')
    .replace(',', '.')

  if (!cleaned) return null
  const value = Number.parseFloat(cleaned)
  if (Number.isNaN(value)) return null
  return negative ? -value : value
}

function parsePeriodLabel(label) {
  const match = String(label)
    .trim()
    .toUpperCase()
    .match(/(INGRESOS|GASTOS)\s+([A-Z]{3})\s+(\d{2})/)
  if (!match) return null

  const month = MONTH_MAP[match[2]]
  const year = 2000 + Number.parseInt(match[3], 10)
  if (!month || Number.isNaN(year)) return null

  return { type: match[1], month, year }
}

function mapCategory(header) {
  const h = String(header ?? '')
    .trim()
    .toUpperCase()

  if (!h || h === 'TOTAL' || h === 'EXCEDENTE') return null
  if (h.startsWith('OTROS')) return 'otros'
  if (h.includes('ALQUILER')) return 'alquiler'
  if (h.includes('EXPENSA')) return 'expensas'
  if (h === 'AGUA') return 'agua'
  if (h === 'TGI') return 'tgi'
  if (h === 'EPE') return 'epe'
  if (h.includes('INTERNET')) return 'internet'
  if (h === 'GAS') return 'otros'
  return null
}

function parsePagoFinal(cells) {
  for (const cell of cells) {
    const match = String(cell ?? '').match(/Pago final\s+(\w+)\s*->\s*(\w+)/i)
    if (match) {
      return { from: match[1].toUpperCase(), to: match[2].toUpperCase() }
    }
  }
  return null
}

function splitCsvLine(line) {
  return line.split(';').map((c) => c.trim())
}

export function parseGastosFijosCsv(content) {
  const ingresos = []
  const gastos = []

  const lines = content.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i])
    const label = cells[1] ?? ''
    const period = parsePeriodLabel(label)

    if (!period) continue

    if (period.type === 'INGRESOS') {
      const headerRow = splitCsvLine(lines[i + 1] ?? '')
      const salaryRow = splitCsvLine(lines[i + 2] ?? '')
      if ((headerRow[1] ?? '').toUpperCase() !== 'MATI') continue

      const salaryA = parseMoney(salaryRow[1])
      const salaryB = parseMoney(salaryRow[2])

      if (salaryA != null && salaryB != null) {
        ingresos.push({
          month: period.month,
          year: period.year,
          salary_user_a: salaryA,
          salary_user_b: salaryB,
        })
      }
      continue
    }

    if (period.type === 'GASTOS') {
      const headers = cells.slice(2)
      const categories = headers.map((header) => ({
        header,
        category: mapCategory(header),
      }))

      const montoRow = splitCsvLine(lines[i + 1] ?? '')
      const matiRow = splitCsvLine(lines[i + 2] ?? '')
      const lichiRow = splitCsvLine(lines[i + 3] ?? '')

      if ((matiRow[1] ?? '').toUpperCase() !== 'MATI') continue
      if ((lichiRow[1] ?? '').toUpperCase() !== 'LICHI') continue

      const pagoFinal = parsePagoFinal([...matiRow, ...lichiRow])
      const expenses = []
      const shares = { MATI: {}, LICHI: {} }

      for (let col = 0; col < categories.length; col++) {
        const { category } = categories[col]
        if (!category) continue

        const cellIndex = col + 2
        const amount = parseMoney(montoRow[cellIndex])
        if (amount == null || amount <= 0) continue

        const matiShare = parseMoney(matiRow[cellIndex]) ?? 0
        const lichiShare = parseMoney(lichiRow[cellIndex]) ?? 0

        const existing = expenses.find((e) => e.category === category)
        if (existing) {
          existing.amount = round2(existing.amount + amount)
          shares.MATI[category] = round2((shares.MATI[category] ?? 0) + matiShare)
          shares.LICHI[category] = round2((shares.LICHI[category] ?? 0) + lichiShare)
        } else {
          expenses.push({ category, amount: round2(amount) })
          shares.MATI[category] = round2(matiShare)
          shares.LICHI[category] = round2(lichiShare)
        }
      }

      if (expenses.length > 0) {
        gastos.push({
          month: period.month,
          year: period.year,
          expenses,
          shares,
          pagoFinal,
          total: round2(expenses.reduce((sum, e) => sum + e.amount, 0)),
        })
      }
    }
  }

  return { ingresos, gastos }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function resolvePayerUserId(pagoFinal, usersByKey, defaultPayerKey = 'LICHI') {
  if (pagoFinal?.to) {
    const creditor = usersByKey[pagoFinal.to]
    if (creditor) return creditor.id
  }
  const fallback = usersByKey[defaultPayerKey]
  return fallback?.id ?? null
}

async function createSupabaseClient(env) {
  const url = env.VITE_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = env.VITE_SUPABASE_ANON_KEY
  const key = serviceKey || anonKey

  if (!url || !key) {
    throw new Error('Faltan VITE_SUPABASE_URL y key en .env')
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (!serviceKey && env.IMPORT_USER_EMAIL && env.IMPORT_USER_PASSWORD) {
    const { error } = await client.auth.signInWithPassword({
      email: env.IMPORT_USER_EMAIL,
      password: env.IMPORT_USER_PASSWORD,
    })
    if (error) throw new Error(`Login falló: ${error.message}`)
  } else if (!serviceKey) {
    console.warn(
      '⚠️  Sin SUPABASE_SERVICE_ROLE_KEY ni credenciales IMPORT_USER_*. ' +
        'El insert puede fallar por RLS.',
    )
  }

  return client
}

async function fetchUsersMap(supabase) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!data?.length) throw new Error('No hay usuarios en la tabla users')

  const findByPattern = (pattern) =>
    data.find((u) => pattern.test(u.name.normalize('NFD').replace(/\p{Diacritic}/gu, '')))

  const mati =
    findByPattern(/mati/i) ??
    data[0]
  const lichi =
    findByPattern(/lichi/i) ??
    data[1] ??
    data[0]

  if (mati.id === lichi.id && data.length < 2) {
    throw new Error('Se necesitan dos usuarios (Mati y Lichi) en la tabla users')
  }

  return {
    MATI: mati,
    LICHI: lichi,
    userA: mati,
    userB: lichi,
  }
}

async function importData({ ingresos, gastos, supabase, usersMap, replace }) {
  const stats = {
    balancesUpserted: 0,
    expensesInserted: 0,
    monthsCleared: 0,
  }

  const allPeriods = [
    ...ingresos.map((i) => ({ month: i.month, year: i.year })),
    ...gastos.map((g) => ({ month: g.month, year: g.year })),
  ]

  if (replace && allPeriods.length > 0) {
    const unique = [...new Map(allPeriods.map((p) => [`${p.year}-${p.month}`, p])).values()]
    for (const { month, year } of unique) {
      await supabase.from('fixed_expenses').delete().eq('month', month).eq('year', year)
      await supabase.from('monthly_balances').delete().eq('month', month).eq('year', year)
      stats.monthsCleared++
    }
  }

  for (const row of ingresos) {
    const { error } = await supabase.from('monthly_balances').upsert(
      {
        month: row.month,
        year: row.year,
        salary_user_a: row.salary_user_a,
        salary_user_b: row.salary_user_b,
      },
      { onConflict: 'month,year' },
    )
    if (error) throw new Error(`monthly_balances ${row.month}/${row.year}: ${error.message}`)
    stats.balancesUpserted++
  }

  for (const monthData of gastos) {
    const payerId = resolvePayerUserId(monthData.pagoFinal, usersMap)

    for (const expense of monthData.expenses) {
      const { error } = await supabase.from('fixed_expenses').insert({
        month: monthData.month,
        year: monthData.year,
        category: expense.category,
        amount: expense.amount,
        paid_by_user_id: payerId,
      })
      if (error) {
        throw new Error(
          `fixed_expenses ${monthData.month}/${monthData.year} ${expense.category}: ${error.message}`,
        )
      }
      stats.expensesInserted++
    }
  }

  return stats
}

function printSummary({ ingresos, gastos }) {
  console.log(`\n📊 Resumen del CSV`)
  console.log(`   Ingresos (monthly_balances): ${ingresos.length} meses`)
  console.log(
    `   Gastos fijos: ${gastos.length} meses, ${gastos.reduce((n, g) => n + g.expenses.length, 0)} registros`,
  )

  if (ingresos.length > 0) {
    const first = ingresos[0]
    const last = ingresos[ingresos.length - 1]
    console.log(
      `   Rango ingresos: ${first.month}/${first.year} → ${last.month}/${last.year}`,
    )
  }

  if (gastos.length > 0) {
    const first = gastos[0]
    const last = gastos[gastos.length - 1]
    console.log(`   Rango gastos: ${first.month}/${first.year} → ${last.month}/${last.year}`)
    console.log('\n   Primeros 3 meses de gastos:')
    for (const g of gastos.slice(0, 3)) {
      console.log(
        `   - ${g.month}/${g.year}: total $${g.total.toLocaleString('es-AR')} (${g.expenses.length} categorías)${g.pagoFinal ? ` · Pago ${g.pagoFinal.from}→${g.pagoFinal.to}` : ''}`,
      )
    }
  }
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''")
}

function generateSql({ ingresos, gastos }) {
  const lines = [
    '-- Import histórico desde GastosFijos.csv',
    '-- Ejecutar en Supabase SQL Editor (como postgres, bypass RLS)',
    '-- Requiere dos usuarios en `users` cuyos nombres contengan Mati y Lichi',
    '',
    'DO $$',
    'DECLARE',
    '  mati_id uuid;',
    '  lichi_id uuid;',
    'BEGIN',
    "  SELECT id INTO mati_id FROM users WHERE name ILIKE '%mati%' ORDER BY created_at LIMIT 1;",
    "  SELECT id INTO lichi_id FROM users WHERE name ILIKE '%lichi%' ORDER BY created_at LIMIT 1;",
    '',
    '  IF mati_id IS NULL OR lichi_id IS NULL THEN',
    "    RAISE EXCEPTION 'No se encontraron usuarios Mati y Lichi en la tabla users';",
    '  END IF;',
    '',
  ]

  const periods = [
    ...new Map(
      [...ingresos, ...gastos].map((p) => [`${p.year}-${p.month}`, { month: p.month, year: p.year }]),
    ).values(),
  ]

  for (const { month, year } of periods) {
    lines.push(`  DELETE FROM fixed_expenses WHERE month = ${month} AND year = ${year};`)
    lines.push(`  DELETE FROM monthly_balances WHERE month = ${month} AND year = ${year};`)
  }
  lines.push('')

  for (const row of ingresos) {
    lines.push(
      `  INSERT INTO monthly_balances (month, year, salary_user_a, salary_user_b) VALUES (${row.month}, ${row.year}, ${row.salary_user_a}, ${row.salary_user_b}) ON CONFLICT (month, year) DO UPDATE SET salary_user_a = EXCLUDED.salary_user_a, salary_user_b = EXCLUDED.salary_user_b;`,
    )
  }
  lines.push('')

  for (const monthData of gastos) {
    const payerExpr =
      monthData.pagoFinal?.to === 'MATI'
        ? 'mati_id'
        : monthData.pagoFinal?.to === 'LICHI'
          ? 'lichi_id'
          : 'lichi_id'

    for (const expense of monthData.expenses) {
      lines.push(
        `  INSERT INTO fixed_expenses (month, year, category, amount, paid_by_user_id) VALUES (${monthData.month}, ${monthData.year}, '${sqlEscape(expense.category)}', ${expense.amount}, ${payerExpr});`,
      )
    }
  }

  lines.push('END $$;')
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const dryRun = args.has('--dry-run') || (!args.has('--execute') && !args.has('--sql'))
  const replace = args.has('--replace')
  const sqlOnly = args.has('--sql')

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No se encontró ${CSV_PATH}`)
  }

  const content = fs.readFileSync(CSV_PATH, 'utf8')
  const parsed = parseGastosFijosCsv(content)
  printSummary(parsed)

  if (sqlOnly) {
    const sql = generateSql(parsed)
    const outPath = path.join(ROOT, 'supabase', 'migrations', 'import_gastos_fijos_data.sql')
    fs.writeFileSync(outPath, sql, 'utf8')
    console.log(`\n📄 SQL generado: ${outPath}`)
    console.log('   Ejecutalo en Supabase → SQL Editor')
    return
  }

  if (dryRun) {
    console.log('\n✅ Dry-run OK.')
    console.log('   --sql      genera import_gastos_fijos_data.sql')
    console.log('   --execute  importa directo (--replace borra meses existentes)')
    return
  }

  const env = loadEnvFile()
  const supabase = await createSupabaseClient(env)
  const usersMap = await fetchUsersMap(supabase)

  console.log(`\n👤 Usuarios:`)
  console.log(`   MATI / user A → ${usersMap.MATI.name} (${usersMap.MATI.id})`)
  console.log(`   LICHI / user B → ${usersMap.LICHI.name} (${usersMap.LICHI.id})`)

  const stats = await importData({
    ...parsed,
    supabase,
    usersMap,
    replace,
  })

  console.log('\n✅ Importación completada')
  console.log(`   Meses limpiados: ${stats.monthsCleared}`)
  console.log(`   Sueldos upserted: ${stats.balancesUpserted}`)
  console.log(`   Gastos insertados: ${stats.expensesInserted}`)
}

main().catch((err) => {
  console.error('\n❌', err.message ?? err)
  process.exit(1)
})
