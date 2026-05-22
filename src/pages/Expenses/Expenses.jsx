import { useCallback, useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { AddExpenseForm } from '../../components/expenses/AddExpenseForm'
import { ExpenseBalance } from '../../components/expenses/ExpenseBalance'
import { ExpenseDetail } from '../../components/expenses/ExpenseDetail'
import { ExpenseList } from '../../components/expenses/ExpenseList'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { useApp } from '../../hooks/useApp'
import {
  createDailyExpense,
  deleteDailyExpense,
  fetchDailyExpenses,
  updateDailyExpense,
} from '../../services/expensesService'

const TABS = [
  { id: 'list', label: 'Gastos' },
  { id: 'balance', label: 'Balance' },
]

export function Expenses() {
  const { users, activeUser } = useApp()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await fetchDailyExpenses()
      setExpenses(data)
      setSelectedExpense((prev) =>
        prev ? data.find((e) => e.id === prev.id) ?? null : null,
      )
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
    setSelectedExpense(null)
    setEditingExpense(null)
    setShowNewForm(true)
    setActiveTab('list')
  }

  function handleSelect(expense) {
    setSelectedExpense(expense)
    setShowNewForm(false)
    setEditingExpense(null)
  }

  function handleBackFromDetail() {
    setSelectedExpense(null)
  }

  function handleEditFromDetail() {
    setEditingExpense(selectedExpense)
    setSelectedExpense(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleCreateExpense(expense) {
    await createDailyExpense(expense)
    await loadExpenses()
    setShowNewForm(false)
  }

  async function handleUpdateExpense(expense) {
    const id = editingExpense.id
    await updateDailyExpense(id, expense)
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
      if (selectedExpense?.id === expense.id) setSelectedExpense(null)
      if (editingExpense?.id === expense.id) setEditingExpense(null)
      await loadExpenses()
    } catch (err) {
      setListError(err.message ?? 'No se pudo eliminar el gasto')
    } finally {
      setDeletingId(null)
    }
  }

  const formVisible = showNewForm || editingExpense
  const showDetail = selectedExpense && !formVisible

  const headerAction =
    activeTab === 'list' && !showDetail ? (
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
    ) : null

  return (
    <PageWrapper
      title="Gastos"
      description="Gastos diarios y balance en pareja."
      action={headerAction}
    >
      {!showDetail && (
        <Tabs
          tabs={TABS}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id)
            setSelectedExpense(null)
            closeForm()
          }}
        />
      )}

      {formVisible && activeTab === 'list' && (
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

      {listError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {listError}
        </p>
      )}

      {activeTab === 'list' && !formVisible && showDetail && (
        <ExpenseDetail
          expense={selectedExpense}
          users={users}
          onBack={handleBackFromDetail}
          onEdit={handleEditFromDetail}
          onDelete={() => handleDelete(selectedExpense)}
          deleting={deletingId === selectedExpense.id}
        />
      )}

      {activeTab === 'list' && !formVisible && !showDetail && (
        <>
          <button
            type="button"
            onClick={handleStartNew}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-3 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 md:hidden"
          >
            <Plus className="h-5 w-5" />
            Agregar gasto
          </button>
          <ExpenseList
            expenses={expenses}
            users={users}
            loading={loading}
            onSelect={handleSelect}
          />
        </>
      )}

      {activeTab === 'balance' && (
        <ExpenseBalance expenses={expenses} users={users} loading={loading} />
      )}
    </PageWrapper>
  )
}
