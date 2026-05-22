import { useState } from 'react'
import { Users } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { createUser } from '../../services/usersService'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function SetupUsers() {
  const { refreshUsers } = useApp()
  const [form, setForm] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function updateField(index, field, value) {
    setForm((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      for (const user of form) {
        await createUser(user)
      }
      await refreshUsers()
    } catch (err) {
      setError(err.message ?? 'No se pudieron crear los usuarios')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Configurá la pareja</h1>
            <p className="text-sm text-slate-500">
              Creá los dos perfiles que van a usar la app.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {form.map((user, index) => (
            <fieldset key={index} className="space-y-3 rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-sm font-medium text-slate-700">
                Persona {index + 1}
              </legend>
              <input
                type="text"
                required
                placeholder="Nombre"
                value={user.name}
                onChange={(e) => updateField(index, 'name', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={user.email}
                onChange={(e) => updateField(index, 'email', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </fieldset>
          ))}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Crear usuarios'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
