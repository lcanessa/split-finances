import { useMemo, useState } from 'react'
import { Calendar, Check, Loader2 } from 'lucide-react'
import { CURRENCIES, EXPENSE_CATEGORIES } from '../../lib/expenseCategories'
import { formatAmountDisplay, safeEvaluateExpression } from '../../lib/safeMathEval'
import { getInitials } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function buildInitialSplit(users) {
  return Object.fromEntries(users.map((user) => [user.id, true]))
}

export function AddExpenseForm({ users, defaultPaidByUserId, onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('food')
  const [currency, setCurrency] = useState('ARS')
  const [amountInput, setAmountInput] = useState('')
  const [amountValue, setAmountValue] = useState(null)
  const [amountError, setAmountError] = useState(null)
  const [paidByUserId, setPaidByUserId] = useState(
    defaultPaidByUserId ?? users[0]?.id ?? '',
  )
  const [date, setDate] = useState(todayISO())
  const [splitFor, setSplitFor] = useState(() => buildInitialSplit(users))
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const currencyMeta = useMemo(
    () => CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0],
    [currency],
  )

  function handleAmountBlur() {
    if (!amountInput.trim()) {
      setAmountValue(null)
      setAmountError(null)
      return
    }

    try {
      const result = safeEvaluateExpression(amountInput)
      if (result <= 0) {
        throw new Error('El importe debe ser mayor a cero')
      }
      setAmountValue(result)
      setAmountInput(formatAmountDisplay(result))
      setAmountError(null)
    } catch (err) {
      setAmountError(err.message)
      setAmountValue(null)
    }
  }

  function handleAmountFocus() {
    if (amountValue != null) {
      setAmountInput(String(amountValue))
    }
    setAmountError(null)
  }

  function toggleSplit(userId) {
    setSplitFor((prev) => {
      const next = { ...prev, [userId]: !prev[userId] }
      const checkedCount = Object.values(next).filter(Boolean).length
      if (checkedCount === 0) return prev
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    let finalAmount = amountValue
    if (amountInput.trim() && finalAmount == null) {
      try {
        finalAmount = safeEvaluateExpression(amountInput)
        if (finalAmount <= 0) throw new Error('El importe debe ser mayor a cero')
        setAmountValue(finalAmount)
        setAmountInput(formatAmountDisplay(finalAmount))
        setAmountError(null)
      } catch (err) {
        setAmountError(err.message)
        return
      }
    }

    if (!title.trim()) {
      setFormError('Ingresá un título para el gasto')
      return
    }

    if (!finalAmount || finalAmount <= 0) {
      setAmountError('Ingresá un importe válido')
      return
    }

    if (!paidByUserId) {
      setFormError('Seleccioná quién pagó el gasto')
      return
    }

    const participantIds = users.filter((user) => splitFor[user.id]).map((user) => user.id)
    if (participantIds.length === 0) {
      setFormError('Seleccioná al menos una persona para el gasto')
      return
    }

    setSubmitting(true)

    try {
      await onSubmit({
        description: title.trim(),
        category,
        amount: finalAmount,
        currency,
        paid_by_user_id: paidByUserId,
        date,
        split_for: participantIds,
      })
      setTitle('')
      setCategory('food')
      setCurrency('ARS')
      setAmountInput('')
      setAmountValue(null)
      setDate(todayISO())
      setSplitFor(buildInitialSplit(users))
      setAmountError(null)
    } catch (err) {
      setFormError(err.message ?? 'No se pudo guardar el gasto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <Input
        id="expense-title"
        label="Título"
        placeholder="Ej: Supermercado, Cena, Uber..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-base"
      />

      {/* Categorías */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Categoría</p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {EXPENSE_CATEGORIES.map(({ id, label, icon: Icon }) => {
            const selected = category === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-3 py-2.5 transition-colors ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Importe + moneda */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Importe</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
              aria-label="Moneda"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0 o 1500+300*2"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value)
                setAmountValue(null)
                setAmountError(null)
              }}
              onBlur={handleAmountBlur}
              onFocus={handleAmountFocus}
              className="w-full bg-transparent text-3xl font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Podés usar +, -, *, / y paréntesis. Se calcula al salir del campo.
          </p>
          {amountError && (
            <p className="mt-2 text-sm text-red-600">{amountError}</p>
          )}
          {amountValue != null && !amountError && (
            <p className="mt-2 text-sm text-emerald-600">
              = {currencyMeta.symbol} {formatAmountDisplay(amountValue)}
            </p>
          )}
        </div>
      </div>

      {/* Pagado por */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Pagado por</p>
        <div className="grid grid-cols-2 gap-2">
          {users.map((user) => {
            const selected = paidByUserId === user.id
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setPaidByUserId(user.id)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getInitials(user.name)}
                </span>
                {user.name.split(' ')[0]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <label htmlFor="expense-date" className="text-sm font-medium text-slate-700">
          Fecha
        </label>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* División / Para quién */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Para quién</p>
        <p className="text-xs text-slate-500">
          Ambos marcados = se divide. Si desmarcás uno, el gasto es 100% del otro.
        </p>
        <div className="space-y-2">
          {users.map((user) => {
            const checked = splitFor[user.id]
            return (
              <label
                key={user.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                  checked
                    ? 'border-indigo-200 bg-indigo-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {getInitials(user.name)}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{user.name}</span>
                </div>
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSplit(user.id)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 checked:border-indigo-600 checked:bg-indigo-600"
                  />
                  <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {formError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      {/* Acciones sticky en móvil */}
      <div className="sticky bottom-20 z-10 -mx-1 flex gap-2 bg-slate-50/95 py-2 backdrop-blur md:static md:bottom-auto md:bg-transparent md:py-0">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Agregar gasto'
          )}
        </Button>
      </div>
    </form>
  )
}
