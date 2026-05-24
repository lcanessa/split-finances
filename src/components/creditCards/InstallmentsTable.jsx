import { formatAmountDisplay } from '../../lib/safeMathEval'
import { getPeriodLabel } from '../../lib/periodUtils'
import { getFirstName } from '../../lib/expenseBalance'

function SettledSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function InstallmentsTable({
  installments,
  users,
  loading,
  month,
  year,
  updatingId,
  onToggleSettled,
}) {
  const usersById = Object.fromEntries(users.map((u) => [u.id, u]))

  if (loading) {
    return <p className="py-6 text-center text-sm text-slate-500">Cargando cuotas...</p>
  }

  if (installments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
        No hay cuotas para {getPeriodLabel(month, year)}.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Gasto</th>
            <th className="px-4 py-3 font-medium">Cuota</th>
            <th className="px-4 py-3 font-medium">Fecha de pago</th>
            <th className="px-4 py-3 font-medium text-right">Monto unitario</th>
            <th className="px-4 py-3 font-medium">Pagado por</th>
            <th className="px-4 py-3 font-medium text-center">Saldado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {installments.map((row) => {
            const purchase = row.credit_purchases
            const payer = usersById[purchase?.purchased_by_user_id]
            const isUpdating = updatingId === row.id

            return (
              <tr
                key={row.id}
                className={row.settled ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {purchase?.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {row.installment_number}/{purchase?.installments_count ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {getPeriodLabel(row.month, row.year)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  $ {formatAmountDisplay(Number(row.amount))}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {getFirstName(payer?.name) ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <SettledSwitch
                    checked={Boolean(row.settled)}
                    disabled={isUpdating}
                    onChange={(value) => onToggleSettled(row.id, value)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
