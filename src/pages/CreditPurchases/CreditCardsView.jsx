import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { InstallmentsTable } from '../../components/creditCards/InstallmentsTable'
import { PaidByToggle } from '../../components/shared/PaidByToggle'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../hooks/useApp'
import { splitInstallmentAmounts } from '../../lib/installmentSchedule'
import { getPeriodLabel } from '../../lib/periodUtils'
import { formatAmountDisplay } from '../../lib/safeMathEval'
import {
  createCreditPurchaseWithInstallments,
  fetchInstallmentsByMonth,
  updateInstallmentSettled,
} from '../../services/creditCardsService'
import { PeriodSelector } from '../FixedAndSalaries/PeriodSelector'

const now = new Date()

export function CreditCardsView() {
  const { users, activeUser } = useApp()
  const [product, setProduct] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [installmentsCount, setInstallmentsCount] = useState('3')
  const [formPaidBy, setFormPaidBy] = useState('')
  const [firstMonth, setFirstMonth] = useState(now.getMonth() + 1)
  const [firstYear, setFirstYear] = useState(now.getFullYear())
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [gridMonth, setGridMonth] = useState(now.getMonth() + 1)
  const [gridYear, setGridYear] = useState(now.getFullYear())
  const [installments, setInstallments] = useState([])
  const [loadingGrid, setLoadingGrid] = useState(true)
  const [gridError, setGridError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const effectivePaidBy = formPaidBy || activeUser?.id || users[0]?.id || ''

  const previewUnitAmount = useMemo(() => {
    const total = Number(totalAmount)
    const count = Number(installmentsCount)
    if (!total || !count || count <= 0) return null
    return splitInstallmentAmounts(total, count)[0]
  }, [totalAmount, installmentsCount])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadingGrid(true)
      setGridError(null)
      try {
        const data = await fetchInstallmentsByMonth(gridMonth, gridYear)
        if (!cancelled) setInstallments(data)
      } catch (err) {
        if (!cancelled) setGridError(err.message ?? 'No se pudieron cargar las cuotas')
      } finally {
        if (!cancelled) setLoadingGrid(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [gridMonth, gridYear])

  async function reloadGrid() {
    const data = await fetchInstallmentsByMonth(gridMonth, gridYear)
    setInstallments(data)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    const total = Number(totalAmount)
    const count = parseInt(installmentsCount, 10)

    if (!product.trim()) {
      setFormError('Ingresá el nombre del producto')
      return
    }
    if (!total || total <= 0) {
      setFormError('Ingresá un monto total válido')
      return
    }
    if (!count || count <= 0 || !Number.isInteger(count)) {
      setFormError('La cantidad de cuotas debe ser un número entero mayor a cero')
      return
    }
    if (!effectivePaidBy) {
      setFormError('Seleccioná quién pagó')
      return
    }

    setSubmitting(true)
    try {
      await createCreditPurchaseWithInstallments({
        description: product.trim(),
        total_amount: total,
        installments_count: count,
        purchased_by_user_id: effectivePaidBy,
        first_month: firstMonth,
        first_year: firstYear,
      })
      setProduct('')
      setTotalAmount('')
      setInstallmentsCount('3')
      setGridMonth(firstMonth)
      setGridYear(firstYear)
      await reloadGrid()
    } catch (err) {
      setFormError(err.message ?? 'No se pudo guardar la compra')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleSettled(id, settled) {
    setUpdatingId(id)
    setGridError(null)
    try {
      await updateInstallmentSettled(id, settled)
      setInstallments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, settled } : item)),
      )
    } catch (err) {
      setGridError(err.message ?? 'No se pudo actualizar la cuota')
    } finally {
      setUpdatingId(null)
    }
  }

  if (users.length < 2) {
    return (
      <PageWrapper title="Tarjetas" description="Requiere dos perfiles configurados.">
        <Card>
          <p className="text-sm text-slate-600">
            Configurá los dos usuarios de la pareja para usar esta sección.
          </p>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Tarjetas"
      description="Compras en cuotas y seguimiento mensual."
    >
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Nueva compra en cuotas</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            id="credit-product"
            label="Producto"
            placeholder="Ej: Mesa y Sillas, Arredo..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            id="credit-total"
            type="number"
            min="0"
            step="0.01"
            label="Monto total"
            placeholder="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
          />
          <Input
            id="credit-installments"
            type="number"
            min="1"
            step="1"
            label="Cantidad de cuotas"
            placeholder="3"
            value={installmentsCount}
            onChange={(e) => setInstallmentsCount(e.target.value)}
            required
          />
          {previewUnitAmount != null && (
            <p className="text-sm text-indigo-700 sm:col-span-2">
              Monto unitario estimado: $ {formatAmountDisplay(previewUnitAmount)} por cuota
            </p>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <p className="text-sm font-medium text-slate-700">Pagado por</p>
            <PaidByToggle
              users={users}
              value={effectivePaidBy}
              onChange={setFormPaidBy}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-slate-700">Primera cuota</p>
            <PeriodSelector
              month={firstMonth}
              year={firstYear}
              onMonthChange={setFirstMonth}
              onYearChange={setFirstYear}
            />
          </div>
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
              {formError}
            </p>
          )}
          <Button type="submit" className="sm:col-span-2" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando cuotas...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Guardar compra y cuotas
              </>
            )}
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Cuotas del mes</h2>
            <p className="text-xs text-slate-500">
              {getPeriodLabel(gridMonth, gridYear)}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <PeriodSelector
              month={gridMonth}
              year={gridYear}
              onMonthChange={setGridMonth}
              onYearChange={setGridYear}
            />
          </div>
        </div>
        {gridError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{gridError}</p>
        )}
        <InstallmentsTable
          installments={installments}
          users={users}
          loading={loadingGrid}
          month={gridMonth}
          year={gridYear}
          updatingId={updatingId}
          onToggleSettled={handleToggleSettled}
        />
      </Card>
    </PageWrapper>
  )
}
