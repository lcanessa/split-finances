import { UserCircle2 } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { getInitials } from '../../lib/utils'
import { Card } from '../../components/ui/Card'

export function SelectUser() {
  const { users, setActiveUser } = useApp()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">¿Quién está usando la app?</h1>
          <p className="mt-2 text-sm text-slate-500">
            Elegí tu perfil para registrar gastos a tu nombre.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setActiveUser(user)}
              className="text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Card className="flex flex-col items-center gap-4 py-8 hover:border-indigo-300 hover:shadow-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {getInitials(user.name)}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                  <UserCircle2 className="h-4 w-4" />
                  Entrar
                </span>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
