import { useCallback, useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { AddExpenseForm } from '../../components/expenses/AddExpenseForm'
import { ExpenseList } from '../../components/expenses/ExpenseList'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useApp } from '../../hooks/useApp'
import {
  createDailyExpense,
  deleteDailyExpense,
  fetchDailyExpenses,
  updateDailyExpense,
} from '../../services/expensesService'

export function Expenses() {
  const { users, activeUser } = useApp()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

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

  function closeForm() {
    setShowNewForm(false)
    setEditingExpense(null)
  }

  function handleStartNew() {
    setEditingExpense(null)
    setShowNewForm(true)
  }

  function handleEdit(expense) {
    setShowNewForm(false)
    setEditingExpense(expense)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleCreateExpense(expense) {
    await createDailyExpense(expense)
    await loadExpenses()
    setShowNewForm(false)
  }

  async function handleUpdateExpense(expense) {
    await updateDailyExpense(editingExpense.id, expense)
    await loadExpenses()
    setEditingExpense(null)
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `¿Eliminar el gasto "${expense.description}"?`,
    )
    if (!confirmed) return

    setDeletingId(expense.id)
    try {
      await deleteDailyExpense(expense.id)
      if (editingExpense?.id === expense.id) {
        setEditingExpense(null)
      }
      await loadExpenses()
    } catch (err) {
      setListError(err.message ?? 'No se pudo eliminar el gasto')
    } finally {
      setDeletingId(null)
    }
  }

  const formVisible = showNewForm || editingExpense

  return (
    <PageWrapper
      title="Gastos"
      description="Gastos diarios compartidos."
      action={
        !formVisible ? (
          <Button size="sm" onClick={handleStartNew}>
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={closeForm}>
            <X className="h-4 w-4" />
            Cerrar
          </Button>
        )
      }
    >
      {formVisible && (
        <Card className="p-4 sm:p-6">
          <AddExpenseForm
            key={editingExpense?.id ?? 'new'}
            users={users}
            defaultPaidByUserId={activeUser?.id}
            editingExpense={editingExpense}
            onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
            onCancel={closeForm}
          />
        </Card>
      )}

      {!formVisible && (
        <button
          type="button"
          onClick={handleStartNew}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-3 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 md:hidden"
        >
          <Plus className="h-5 w-5" />
          Agregar gasto
        </button>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Todos los gastos ({loading ? '…' : expenses.length})
        </h2>
        {listError && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {listError}
            {listError.includes('column') && (
              <span className="mt-1 block text-xs">
                Ejecutá la migración en{' '}
                <code>supabase/migrations/add_daily_expense_fields.sql</code>
              </span>
            )}
          </p>
        )}
        <ExpenseList
          expenses={expenses}
          users={users}
          loading={loading}
          editingId={editingExpense?.id}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </PageWrapper>
  )
}
