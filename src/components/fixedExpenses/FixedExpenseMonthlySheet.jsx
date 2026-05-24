import { getFirstName } from '../../lib/expenseBalance'
import { resolveCoupleUsers } from '../../lib/coupleUsers'
import { FIXED_EXPENSE_CATEGORIES } from '../../lib/fixedExpenseCategories'
import { formatPercentChange } from '../../lib/percentChange'
import { getPeriodLabel } from '../../lib/periodUtils'
import { formatAmountDisplay } from '../../lib/safeMathEval'

function Th({ children, right }) {
  return (
    <th
      className={`whitespace-nowrap px-2 py-1.5 text-[10px] font-bold uppercase sm:text-xs ${
        right ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function Td({ children, right, className = '' }) {
  return (
    <td
      className={`whitespace-nowrap px-2 py-1.5 text-xs sm:text-sm ${
        right ? 'text-right' : 'text-left'
      } ${className}`}
    >
      {children}
    </td>
  )
}

function PctCell({ value }) {
  if (value == null) return <Td right className="text-slate-400">—</Td>
  const cls =
    value > 0 ? 'text-red-600' : value < 0 ? 'text-emerald-600' : 'text-slate-500'
  return (
    <Td right className={`font-medium ${cls}`}>
      {formatPercentChange(value)}
    </Td>
  )
}

function SheetInput(props) {
  return (
    <input
      {...props}
      type="number"
      min="0"
      step="0.01"
      inputMode="decimal"
      className="sheet-input w-full min-w-[4rem] rounded border border-transparent bg-white/90 px-1 py-0.5 text-right text-xs font-medium outline-none focus:border-indigo-400 sm:min-w-[5rem] sm:text-sm"
    />
  )
}

export function FixedExpenseMonthlySheet({
  users,
  month,
  year,
  incomePeriod,
  prevExpensesPeriod,
  sheetData,
  salaryA,
  salaryB,
  onSalaryAChange,
  onSalaryBChange,
  onSalaryBlur,
  onCategoryAmountChange,
  onCategoryAmountBlur,
  categoryDrafts,
  savingSalaries,
}) {
  const { userA, userB } = resolveCoupleUsers(users)
  const {
    displayCategories,
    prevMontos,
    total,
    prevTotal,
    totalChange,
    expensesOverIncomePercent,
    income,
    incomeChanges,
    categoryChanges,
    report,
    prevReport,
  } = sheetData

  const rowA = report.userRows.find((r) => r.userId === userA.id)
  const rowB = report.userRows.find((r) => r.userId === userB.id)
  const cats =
    displayCategories.length > 0 ? displayCategories : FIXED_EXPENSE_CATEGORIES

  return (
    <div className="space-y-6">
      {prevReport && (
        <section>
          <div className="mb-2 flex flex-wrap justify-between gap-2">
            <h3 className="text-xs font-bold uppercase text-slate-600">
              Gastos {getPeriodLabel(prevExpensesPeriod.month, prevExpensesPeriod.year)} (mes anterior)
            </h3>
            <span className="text-xs font-semibold text-slate-800">
              Total: $ {formatAmountDisplay(prevTotal)}
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <Th />
                  {cats.map((c) => (
                    <Th key={c.id} right>
                      {c.label}
                    </Th>
                  ))}
                  <Th right>Total</Th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-100">
                  <Td className="font-semibold">Monto</Td>
                  {cats.map((c) => (
                    <Td key={c.id} right>
                      $ {formatAmountDisplay(prevMontos[c.id] ?? 0)}
                    </Td>
                  ))}
                  <Td right className="font-bold">
                    $ {formatAmountDisplay(prevTotal)}
                  </Td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase text-indigo-800">
          Ingresos {getPeriodLabel(incomePeriod.month, incomePeriod.year)}
        </h3>
        <p className="mb-2 text-[11px] text-slate-500">
          Proporción para gastos de {getPeriodLabel(month, year)}
        </p>
        <div className="overflow-x-auto rounded-lg border border-indigo-200 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-indigo-700 text-white">
                <Th />
                <Th right>{getFirstName(userA.name)}</Th>
                <Th right>{getFirstName(userB.name)}</Th>
                <Th right>Total</Th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-indigo-50/70">
                <Td className="font-medium text-slate-600">Aumento %</Td>
                <PctCell value={incomeChanges.salaryA} />
                <PctCell value={incomeChanges.salaryB} />
                <PctCell value={incomeChanges.total} />
              </tr>
              <tr>
                <Td className="font-semibold">Sueldo</Td>
                <Td right>
                  <SheetInput
                    value={salaryA}
                    onChange={(e) => onSalaryAChange(e.target.value)}
                    onBlur={onSalaryBlur}
                  />
                </Td>
                <Td right>
                  <SheetInput
                    value={salaryB}
                    onChange={(e) => onSalaryBChange(e.target.value)}
                    onBlur={onSalaryBlur}
                  />
                </Td>
                <Td right className="font-semibold">
                  {savingSalaries ? '…' : `$ ${formatAmountDisplay(income.total)}`}
                </Td>
              </tr>
              <tr className="bg-indigo-50/40">
                <Td className="font-semibold">%</Td>
                <Td right>{Math.round(income.percentA)}%</Td>
                <Td right>{Math.round(income.percentB)}%</Td>
                <Td right>100%</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap justify-between gap-2">
          <h3 className="text-xs font-bold uppercase text-slate-800">
            Gastos {getPeriodLabel(month, year)}
          </h3>
          {totalChange != null && (
            <span className="text-xs text-slate-500">
              vs anterior:{' '}
              <span
                className={
                  totalChange > 0
                    ? 'font-semibold text-red-600'
                    : totalChange < 0
                      ? 'font-semibold text-emerald-600'
                      : 'font-semibold'
                }
              >
                {formatPercentChange(totalChange)}
              </span>
            </span>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-700 text-white">
                <Th />
                {cats.map((c) => (
                  <Th key={c.id} right>
                    {c.label}
                  </Th>
                ))}
                <Th right>Total</Th>
                <Th right>Ant.</Th>
                <Th right>% ing.</Th>
              </tr>
              <tr className="bg-slate-200">
                <Td className="font-medium text-slate-600">Aumento %</Td>
                {cats.map((c) => (
                  <PctCell key={c.id} value={categoryChanges[c.id]} />
                ))}
                <PctCell value={totalChange} />
                <Td />
                <Td />
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-100">
                <Td className="font-semibold">Monto</Td>
                {cats.map((c) => (
                  <Td key={c.id} right>
                    <SheetInput
                      value={categoryDrafts[c.id] ?? ''}
                      onChange={(e) => onCategoryAmountChange(c.id, e.target.value)}
                      onBlur={() => onCategoryAmountBlur(c.id)}
                    />
                  </Td>
                ))}
                <Td right className="font-bold">
                  $ {formatAmountDisplay(total)}
                </Td>
                <Td right className="text-xs text-slate-500">
                  {prevTotal > 0 ? `$ ${formatAmountDisplay(prevTotal)}` : '—'}
                </Td>
                <Td right className="font-bold text-indigo-800">
                  {expensesOverIncomePercent != null
                    ? `${expensesOverIncomePercent.toFixed(1).replace('.', ',')}%`
                    : '—'}
                </Td>
              </tr>
              <tr className="bg-slate-50">
                <Td className="font-semibold">{getFirstName(userA.name)}</Td>
                {cats.map((c) => (
                  <Td key={c.id} right>
                    $ {formatAmountDisplay(rowA?.shares[c.id] ?? 0)}
                  </Td>
                ))}
                <Td right className="font-semibold">
                  $ {formatAmountDisplay(rowA?.totalShare ?? 0)}
                </Td>
                <Td right className="text-xs">
                  {rowA?.expensePercentOfIncome != null
                    ? `${rowA.expensePercentOfIncome.toFixed(2).replace('.', ',')}%`
                    : '—'}
                </Td>
                <Td right className="text-emerald-700">
                  {rowA?.excedente != null
                    ? `$ ${formatAmountDisplay(rowA.excedente)}`
                    : '—'}
                </Td>
              </tr>
              <tr className="bg-rose-50/80">
                <Td className="font-semibold">{getFirstName(userB.name)}</Td>
                {cats.map((c) => (
                  <Td key={c.id} right>
                    $ {formatAmountDisplay(rowB?.shares[c.id] ?? 0)}
                  </Td>
                ))}
                <Td right className="font-semibold">
                  $ {formatAmountDisplay(rowB?.totalShare ?? 0)}
                </Td>
                <Td right className="text-xs">
                  {rowB?.expensePercentOfIncome != null
                    ? `${rowB.expensePercentOfIncome.toFixed(2).replace('.', ',')}%`
                    : '—'}
                </Td>
                <Td right className="text-emerald-700">
                  {rowB?.excedente != null
                    ? `$ ${formatAmountDisplay(rowB.excedente)}`
                    : '—'}
                </Td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
