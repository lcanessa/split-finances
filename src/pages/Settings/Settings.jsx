import { useApp } from '../../hooks/useApp'
import { useAuth } from '../../hooks/useAuth'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Card } from '../../components/ui/Card'

export function Settings() {
  const { users, activeUser } = useApp()
  const { user: authUser } = useAuth()

  return (
    <PageWrapper
      title="Configuración"
      description="Usuarios, sueldos mensuales y preferencias."
    >
      <Card>
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Sesión de acceso</h2>
        <p className="mb-4 text-sm text-slate-500">{authUser?.email}</p>

        <h2 className="mb-3 text-sm font-semibold text-slate-900">Perfiles de la pareja</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="text-slate-700">
                {user.name} — {user.email}
              </span>
              {user.id === activeUser?.id && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  Activo
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="text-sm text-slate-600">
          La carga de sueldos mensuales (`monthly_balances`) se agrega en el próximo paso.
        </p>
      </Card>
    </PageWrapper>
  )
}
