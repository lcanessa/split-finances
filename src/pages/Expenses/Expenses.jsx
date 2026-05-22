import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { AddExpenseForm } from '../../components/expenses/AddExpenseForm'
import { ExpenseList } from '../../components/expenses/ExpenseList'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useApp } from '../../hooks/useApp'
import { createDailyExpense, fetchDailyExpenses } from '../../services/expensesService'

export function Expenses() {
  const { users, activeUser } = useApp()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(true)
  const [listError, setListError] = useState(null)

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await fetchDailyExpenses()
      setExpenses(data)
    } catch (err) {
      setListError(err.message ?? 'No se pudieron cargar los gastos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setListError(null)
      try {
        const data = await fetchDailyExpenses()
        if (!cancelled) setExpenses(data)
      } catch (err) {
        if (!cancelled) {
          setListError(err.message ?? 'No se pudieron cargar los gastos')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreateExpense(expense) {
    await createDailyExpense(expense)
    await loadExpenses()
    setShowForm(false)
  }

  return (
    <PageWrapper
      title="Gastos"
      description="Gastos diarios compartidos."
      action={
        !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        )
      }
    >
      {showForm ? (
        <Card className="p-4 sm:p-6">
          <AddExpenseForm
            users={users}
            defaultPaidByUserId={activeUser?.id}
            onSubmit={handleCreateExpense}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-4 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 md:hidden"
        >
          <Plus className="h-5 w-5" />
          Agregar gasto
        </button>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Recientes</h2>
        {listError && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {listError}
            {listError.includes('column') && (
              <span className="block mt-1 text-xs">
                Ejecutá la migración en{' '}
                <code>supabase/migrations/add_daily_expense_fields.sql</code>
              </span>
            )}
          </p>
        )}
        <ExpenseList expenses={expenses} users={users} loading={loading} />
      </div>
    </PageWrapper>
  )
}
